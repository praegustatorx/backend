import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/login', (req: Request, res: Response): void => {

    const { email, password } = req.body;


    console.log('email:', email);
    console.log('password', password);
    if (typeof email !== 'string' || typeof password !== 'string') {
        res.status(400).json({ message: 'Invalid email or password' });
        return;
    }

    const modifiedEmail = `${email.toUpperCase()} ACTUALLY`;
    const modifiedPassword = password.toUpperCase();

    res.json({
        email: modifiedEmail,
        password: modifiedPassword,
    });
});

router.get('/test', (req: Request, res: Response): void => {
    console.log('Hello World');
    res.status(200).json({
        message: 'Server is running and the test endpoint is working!',
    });
});

router.post('/signup', (req: Request, res: Response): void => {
    //
});

export default router;
