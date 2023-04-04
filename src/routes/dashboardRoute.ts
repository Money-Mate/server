import express from "express";
import * as controller from "../controllers/dashboardController";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

router.get("/main", authenticate, controller.getDashboardData);

export default router;
