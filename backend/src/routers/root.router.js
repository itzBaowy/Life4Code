import express from 'express';
import authRouter from './auth.router.js';
import courseRouter from './course.router.js';
import userRouter from './user.router.js';
import roleRouter from './role.router.js';
import uploadRouter from './upload.router.js';
import paymentRouter from './payment.router.js';



const rootRouter = express.Router()

rootRouter.use("/auth", authRouter)
rootRouter.use('/course', courseRouter)
rootRouter.use('/users', userRouter)
rootRouter.use('/roles', roleRouter)
rootRouter.use('/upload', uploadRouter)
rootRouter.use('/payment', paymentRouter)


export default rootRouter;