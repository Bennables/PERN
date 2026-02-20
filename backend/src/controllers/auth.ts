import { createToken, refreshTokens } from '../helpers/helpers.js'
import { prisma } from '../lib/prisma.js'
import { redisClient } from '../lib/redis.js'
import * as argon2 from 'argon2'
import 'dotenv/config'

const login = async (req, res) => {
    try {
        const password = req.body?.password
        const username = req.body?.username

        if (!username || !password) {
            return res.status(400).json({
                error: true,
                message: 'Username and password are required',
            })
        }

        const user = await prisma.users.findUnique({
            where: { username },
        })

        if (!user) {
            return res
                .status(404)
                .json({ error: true, message: 'User not found' })
        }

        if (!process.env.SECRET_PEPPER) {
            return res.status(500).json({
                error: true,
                message: 'WE ARE MISSING PEPPER',
            })
        }

        const verified = await argon2.verify(user.pwHashed, password, {
            secret: Buffer.from(process.env.SECRET_PEPPER),
        })

        if (!verified) {
            return res
                .status(400)
                .json({ error: true, message: 'Invalid password' })
        }

        const tokens = await createToken(username)
        res.cookie('refreshToken', tokens[1], {
            sameSite: 'lax',
            httpOnly: true,
        })
        return res.status(200).json({
            error: false,
            message: 'correct',
            token: tokens[0],
        })
    } catch (err) {
        console.error('Login error:', err)
        return res.status(500).json({
            error: true,
            message: 'Login failed',
        })
    }
}

const register = async (req, res) => {
    try {
        const username = req.body?.username?.trim()
        const password =
            req.body?.password != null ? String(req.body.password) : ''
        const orgName = req.body?.orgName
            ? String(req.body.orgName).trim()
            : null
        console.log(orgName)
        console.log('SLDFJ')
        if (!username || !password) {
            return res.status(400).json({
                error: true,
                message: 'Username and password are required',
            })
        }

        const existing = await prisma.users.findUnique({
            where: { username },
        })
        console.log('we have the username')
        if (existing) {
            return res.status(400).json({
                error: true,
                message: 'This username already exists',
            })
        }
        console.log('Registed)')
        let org = null
        if (orgName) {
            org = await prisma.org.findUnique({ where: { name: orgName } })
            if (!org) {
                return res
                    .status(404)
                    .json({ error: true, message: 'Organization not found' })
            }
        }
        console.log(org)
        if (!process.env.SECRET_PEPPER) {
            return res.status(500).json({
                error: true,
                message: 'WE ARE MISSING A PEPPER FOR PASSWORDS',
            })
        }
        const hash = await argon2.hash(password, {
            secret: Buffer.from(process.env.SECRET_PEPPER),
            type: argon2.argon2id,
        })
        console.log(hash)
        const newUser = await prisma.users.create({
            data: {
                username,
                pwHashed: hash,
                lvl: 1,
                currXp: 0,
            },
        })
        console.log('JOINING THEM')
        if (org) {
            const data = await prisma.org_Members.create({
                data: {
                    org_id: org.ID,
                    user_id: newUser.ID,
                },
            })
            console.log(data)
        }

        return res.status(201).json({ error: false, message: 'created' })
    } catch (err) {
        console.error('Register error:', err)
        return res.status(500).json({
            error: true,
            message: 'Registration failed' + err,
        })
    }
}

const new_refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken

        if (!refreshToken || refreshToken === 'undefined') {
            return res.status(401).json({
                error: true,
                message: 'Refresh token is required',
            })
        }

        const refreshed = await refreshTokens(refreshToken)
        if (refreshed == null) {
            return res.status(401).json({
                error: true,
                message: 'Invalid or expired refresh token',
            })
        }

        res.cookie('refreshToken', refreshed[1], {
            sameSite: 'lax',
            httpOnly: true,
        })
        return res.status(200).json({
            error: false,
            message: 'refreshed',
            token: refreshed[0],
        })
    } catch (err) {
        console.error('Refresh token error:', err)
        return res.status(500).json({
            error: true,
            message: 'Token refresh failed',
        })
    }
}

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken
        if (!refreshToken) {
            return res.status(400).json({
                error: true,
                message: 'No refresh token to revoke',
            })
        }

        if (!redisClient.isOpen) await redisClient.connect()
        await redisClient.sRem('refreshTokens', refreshToken)

        res.clearCookie('refreshToken')
        return res.status(200).json({
            error: false,
            message: 'Logged out successfully',
        })
    } catch (err) {
        console.error('Logout error:', err)
        return res.status(500).json({
            error: true,
            message: 'Logout failed',
        })
    }
}

const clear = (req, res) => {
    try {
        res.clearCookie('refreshToken')
        return res.status(200).json({
            error: false,
            message: 'Cookies have been cleared',
        })
    } catch (err) {
        console.error('Clear cookies error:', err)
        return res.status(500).json({
            error: true,
            message: 'Failed to clear cookies',
        })
    }
}

export { login, register, new_refresh, logout, clear }
