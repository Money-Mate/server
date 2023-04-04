import express from "express";
import * as controller from "../controllers/transactionController";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

router.post("/add", authenticate, controller.addTransaction);
router.get("/getMy", authenticate, controller.getMyTransactions);
router.put("/updateMy", authenticate, controller.updateMyTransaction);
router.delete("/deleteMy/:id", authenticate, controller.deleteMyTransaction);

router.get("/all", authenticate, controller.getAllTransactions);
router.get("/one/:id", authenticate, controller.getTransactionById);
router.delete("/delete/:id", authenticate, controller.deleteTransactionById);

export default router;
