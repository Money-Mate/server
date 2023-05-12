import express from "express";
import * as controller from "../controllers/investmentController"
import authenticate from "../middlewares/authenticate";
import cookieRefresh from "../middlewares/cookieRefresh";

const router = express.Router();

router.get("/main", authenticate, cookieRefresh, controller.getInvestmentData);

export default router;