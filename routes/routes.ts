//Archaic File, in theory this should be replaced at some point.

import { Router, type Request, type Response } from 'express';
import { profileGet, profilePhotoPost, upload } from '../controllers/userController.js';

const router = Router();

router.get('/quizScore', (_req: Request, res: Response) => {
  res.render('landing');
});

router.get('/login', (_req: Request, res: Response) => {
  res.render('login');
});

//this makes it so logged-in users can't sign up
router.get('/signup', (req: Request, res: Response) => {
  if (req.session.userId) {
    res.redirect('/profile');
    return;
  }

  res.render('signup');
});

router.get('/quiz', (_req: Request, res: Response) => {
  res.render('quizTemplate');
});

router.get('/madrid/wiki', (_req: Request, res: Response) => {
  res.render('madridWiki');
});

router.get('/madrid/quiz', (_req: Request, res: Response) => {
  res.render('madridQuiz');
});

router.get('/profile/:id', profileGet);
router.get('/profile', profileGet);
router.post('/profile/photo', upload.single('photo'), profilePhotoPost);

export default router;
