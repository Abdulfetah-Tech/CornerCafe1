import { Router, type IRouter } from "express";
import healthRouter from "./health";
import cornerCafeRouter from "./corner-cafe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(cornerCafeRouter);

export default router;
