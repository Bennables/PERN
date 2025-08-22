import {express, Router} from 'express'
import { login, register } from '../controllers/account';

const router = express.Router();

router.post("/login", login)
router.register("/register", register)


export default router