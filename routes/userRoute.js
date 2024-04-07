import express from 'express';
import { registerUser, verifyUserEmail, loginUser } from '../controllers/auth.js';



const router = express.Router();

router.post('/register', registerUser);
router.get('/confirm/:userId/:token', verifyUserEmail);
router.post('/login', loginUser);

export default router;