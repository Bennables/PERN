import { Router } from 'express'
import { findOrg, createOrg } from '../controllers/org.js'
import { verifyToken } from '../helpers/helpers.js'
import 'dotenv/config'

const router = Router()

// Public: find org by name
router.get('/org/find', findOrg)

// Protected: create org
router.post('/org', verifyToken, createOrg)

export default router
