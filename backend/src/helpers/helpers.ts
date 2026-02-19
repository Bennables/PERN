import jwt from 'jsonwebtoken'
import { redisClient } from '../lib/redis.js'
import { prisma } from '../lib/prisma.js'
import { v4 as uuidv4 } from 'uuid'
import 'dotenv/config'

const createToken = async (user) => {
    console.log('running create token')
    const token = jwt.sign({ user: user }, process.env.JWT_SECRET_KEY, {
        expiresIn: '30s',
    })
    const refreshToken = jwt.sign(
        { user: user },
        process.env.REFRESH_SECRET_KEY,
        { expiresIn: '7d' }
    )

    // console.log("The JWT is: " + token)
    await redisClient.SADD('refreshTokens', refreshToken)

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
    // console.log(req.headers);
    try {
        console.log('verifying token')

        const token = req.headers['authorization'].split(' ')[1]
        if (!token) {
            console.log('THERE"S NO TOKEN')
        }
        const jwtVerified = jwt.verify(token, process.env.JWT_SECRET_KEY)
        /* the format of jwtverified is a json
        {
            user: 'ben',
            jwtid: 'd6b114fc-6e45-4ebd-bd53-7ccb85ff9493',
            iat: 1755888544,
            exp: 1755892144
        } 
        */

        req.user = jwtVerified.user

        // console.log(jwtVerified);
        // console.log(jwtVerified.user);
        next()
    } catch (e) {
        //this should get you a new refreshtoken. Done in the front end.
        if (e.name == 'TokenExpiredError') {
            // console.log(e);
            return res.status(401).send({ message: 'token expired' })
        }
        // console.log(e)

        //this should redirect to login

        console.log(e.name + ' ' + e.message)
        // console.log(e)
        return res.status(400).send({ message: 'bad token' })
    }
}

const refreshTokens = async (refreshToken) => {
    const verifiedRefresh = jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET_KEY
    )
    if (await redisClient.sIsMember('refreshTokens', refreshToken)) {
        await redisClient.sRem('refreshTokens', refreshToken)
        const newTokens = await createToken(verifiedRefresh.user)
        console.log('newtokesn ' + newTokens[1])
        return newTokens
    } else {
        return null
    }
}

export { createToken, getUserOrgID, getUserID, verifyToken, refreshTokens }
