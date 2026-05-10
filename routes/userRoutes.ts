import { deletePost, loginPost, logoutPost, signupPost } from '../controllers/userController.js';
import { Router } from 'express';

const router = Router();

router.post('/addPlayer', signupPost);

router.post('/loginPlayer', loginPost);

router.post('/logout', logoutPost);

router.post('/deleteUser', deletePost);

export default router;
