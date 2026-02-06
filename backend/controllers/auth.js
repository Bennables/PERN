import { createToken, refreshTokens } from "../helpers/helpers.js";
import { prisma } from "../lib/prisma.js";
import { redisClient } from "../lib/redis.js";
import argon2 from 'argon2';

const login = async (req, res) => {
    console.log("running login")
    const password = req.body.password;
    const username = req.body.username;

    const user = await prisma.users.findUnique({
        where: { username }
    });

    if (!user) {
        return res.status(404).json({ "error": true, "message": "user not found" });
    }

    const verified = await argon2.verify(user.pwHashed, password, { secret: Buffer.from(process.env.SECRET_PEPPER) })
    console.log("THE PASS IS " + (verified ? "correct" : "incorrect"))

    if (verified) {
        const tokens = await createToken(username);
        console.log("THE TOKESN ARE HERE")
        res.cookie("refreshToken", tokens[1], { sameSite: 'lax', httpOnly: true })
        res.status(200).json({ "error": false, "message": "correct", "token": tokens[0] });
        console.log(tokens);
    }
    else{
        res.status(400).json({"error": true, "message": "password is wrong"})
    }
}

const register = async (req, res) => {
    console.log("NEW REGISTRATION");
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password.toString();
    const orgName = req.body.orgName ? req.body.orgName.trim() : null;

    const existing = await prisma.users.findUnique({
        where: { username }
    });

    if (existing) {
        console.log("DUPLICATE USERNAME")
        res.status(400).json({"error": true, "message": "This username already exists"})
        return;
    }

    // If an org name was provided, verify it exists before creating the user
    let org = null;
    if (orgName) {
        org = await prisma.org.findUnique({ where: { name: orgName } });
        if (!org) {
            return res.status(404).json({ "error": true, "message": "Organization not found" });
        }
    }

    const hash = await argon2.hash(password, { secret: Buffer.from(process.env.SECRET_PEPPER), type: argon2.argon2id })
    const newUser = await prisma.users.create({
        data: {
            username,
            pwHashed: hash,
            lvl: 1,
            currXp: 0
        }
    });

    // Add user to org if one was provided
    if (org) {
        await prisma.org_members.create({
            data: {
                org_id: org.ID,
                user_id: newUser.ID
            }
        });
    }

    res.status(201).json({"error": false, "message": "created"})
}

const new_refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    console.log(req.cookies)

    if (!refreshToken || refreshToken == undefined || refreshToken == 'undefined') {
        console.log("token doesn't exist")
        res.status(401).json({ "error": true, "message": "token doesn't exist" });
        return
    }
    const refreshed = await refreshTokens(refreshToken);
    if (refreshed == null) {
        res.status(400).json({ "error": true, "message": "it doesn't exist yet" })
        return
    }
    res.cookie("refreshToken", refreshed[1], { sameSite: 'lax', httpOnly: true })
    res.status(200).json({ "error": false, "message": "refreshed", "token": refreshed[0] })
}

const logout = async (req, res) => {
    console.log(req.body);
    console.log("LOGGED OUT")
    console.log("REFREH IS" + req.cookies.refreshToken)

    if (!redisClient.isOpen) await redisClient.connect();
    const result = await redisClient.sRem("refreshTokens", req.cookies.refreshToken);
    const tokesn = await redisClient.sMembers("refreshTokens");

    console.log("removed " + result)
    console.log(tokesn)
}

const clear = (req, res) => {
    res.clearCookie("refreshToken");
    res.status(200).json({ "error": false, "message": "cookies have been cleared" });
}

export { login, register, new_refresh, logout, clear };
