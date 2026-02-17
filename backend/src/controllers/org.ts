import { prisma } from '../lib/prisma.js'
import { getUserID } from '../helpers/helpers.js'

const findOrg = async (req, res) => {
    try {
        const name = (req.query.name || '').toString().trim()

        if (!name) {
            return res
                .status(400)
                .json({ error: true, message: 'Organization name is required' })
        }

        const result = await prisma.org.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive',
                },
            },
            select: {
                ID: true,
                name: true,
            },
        })

        if (!result) {
            return res
                .status(404)
                .json({ error: true, message: 'Organization not found' })
        }

        return res
            .status(200)
            .json({ error: false, message: 'found', org: result })
    } catch (error) {
        console.log('Error finding organization:', error)
        return res
            .status(500)
            .json({ error: true, message: 'Failed to find organization' })
    }
}

const createOrg = async (req, res) => {
    try {
        const { name } = req.body

        if (!name || !name.trim()) {
            console.log("couldn't get from team")
            return res
                .status(400)
                .json({ error: true, message: 'Organization name is required' })
        }

        const orgName = name.trim()

        const existing = await prisma.org.findUnique({
            where: { name: orgName },
        })

        if (existing) {
            return res.status(400).json({
                error: true,
                message: 'Organization name already exists',
            })
        }

        const user_id = await getUserID(req.user)

        const created = await prisma.org.create({
            data: {
                name: orgName,
                members: {
                    create: {
                        user_id,
                    },
                },
            },
        })

        res.status(201).json({
            error: false,
            message: 'Organization created',
            org_id: created.ID,
        })
    } catch (error) {
        console.log('Error creating organization:', error)
        res.status(500).json({
            error: true,
            message: 'Failed to create organization',
        })
    }
}

export { findOrg, createOrg }
