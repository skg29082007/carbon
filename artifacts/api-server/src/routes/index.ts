import { Router, type IRouter } from "express";
import healthRouter from "./health";
import activitiesRouter from "./activities";
import actionsRouter from "./actions";
import insightsRouter from "./insights";
import profilesRouter from "./profiles";

const router: IRouter = Router();

router.use(healthRouter);
router.use(activitiesRouter);
router.use(actionsRouter);
router.use(insightsRouter);
router.use(profilesRouter);

export default router;
