import express from "express";
import * as controller from "../controllers/accountController";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

router.post("/add", authenticate, controller.addAccount);
router.get("/getAllMy", authenticate, controller.getMyAccounts);
router.put("/updateMy", authenticate, controller.updateMyAccount);
router.delete("/deleteMy/:id", authenticate, controller.deleteMyAccountById);

router.get("/all", authenticate, controller.getAllAccounts);

export default router;
