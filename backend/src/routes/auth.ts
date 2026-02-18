import { Router } from 'express'
import {
    login,
    register,
    new_refresh,
    logout,
    clear,
} from '../controllers/auth.js'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.get('/auth/refresh', new_refresh)
router.post('/logout', logout)
router.get('/clear', clear)

export default router
