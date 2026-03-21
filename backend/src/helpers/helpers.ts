import jwt from 'jsonwebtoken'
import { redisClient } from '../lib/redis.js'
import { prisma } from '../lib/prisma.js'
import 'dotenv/config'

const createToken = async (user) => {
    console.log(`[createToken] Creating tokens for user: ${user}`)
    const token = jwt.sign({ user: user }, process.env.JWT_SECRET_KEY, {
        expiresIn: '30s',
    })
    const refreshToken = jwt.sign(
        { user: user },
        process.env.REFRESH_SECRET_KEY,
        { expiresIn: '7d' }
    )

    await redisClient.SADD('refreshTokens', refreshToken)
    console.log(`[createToken] Tokens created and refresh token stored in Redis for user: ${user}`)

    return [token, refreshToken]
}

const getUserID = async (user) => {
    const userRecord = await prisma.users.findUnique({
        where: { username: user },
        select: { ID: true },
    })
    return userRecord?.ID
}

const getUserOrgID = async (user) => {
    const userRecord = await prisma.users.findUnique({
        where: { username: user },
        select: { ID: true },
    })

    if (!userRecord) return null

    const org_member = await prisma.org_Members.findFirst({
        where: { user_id: userRecord.ID },
        select: { org_id: true },
    })

    return org_member?.org_id ?? null
}

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']
        if (!authHeader) {
            console.log('[verifyToken] No authorization header present')
            return res.status(401).send({ message: 'no token provided' })
        }

        const token = authHeader.split(' ')[1]
        if (!token) {
            console.log('[verifyToken] Authorization header malformed')
            return res.status(401).send({ message: 'no token provided' })
        }

        console.log('[verifyToken] Verifying access token...')
        const jwtVerified = jwt.verify(token, process.env.JWT_SECRET_KEY)

        req.user = jwtVerified.user
        console.log(`[verifyToken] Token valid for user: ${req.user}`)
        next()
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            console.log('[verifyToken] Token expired — client should refresh')
            return res.status(401).send({ message: 'token expired' })
        }
        console.log(`[verifyToken] Invalid token — ${e.name}: ${e.message}`)
        return res.status(400).send({ message: 'bad token' })
    }
}

const refreshTokens = async (refreshToken) => {
    try {
        console.log('[refreshTokens] Verifying refresh token...')
        const verifiedRefresh = jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET_KEY
        )

        const isValid = await redisClient.sIsMember('refreshTokens', refreshToken)
        console.log(`[refreshTokens] Token in Redis: ${isValid}`)

        if (!isValid) {
            console.log('[refreshTokens] Refresh token not found in Redis — possible reuse or logout')
            return null
        }

        await redisClient.sRem('refreshTokens', refreshToken)
        console.log(`[refreshTokens] Old refresh token removed, issuing new tokens for user: ${verifiedRefresh.user}`)

        const newTokens = await createToken(verifiedRefresh.user)
        return newTokens
    } catch (e) {
        console.log(`[refreshTokens] Failed to verify refresh token — ${e.name}: ${e.message}`)
        return null
    }
}

export { createToken, getUserOrgID, getUserID, verifyToken, refreshTokens }
