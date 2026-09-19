import { Router, type IRouter } from "express";
import healthRouter from "./health";
import estimatorRouter from "./estimator";

const router: IRouter = Router();

router.use(healthRouter);
router.use(estimatorRouter);

export default router;
