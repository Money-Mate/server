import express from "express";
import * as controller from "../controllers/dashboardController";
import authenticate from "../middlewares/authenticate";
import cookieRefresh from "../middlewares/cookieRefresh";

const router = express.Router();

router.get("/main", authenticate, cookieRefresh, controller.getDashboardData);

export default router;
