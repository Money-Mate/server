import express from "express";
import * as controller from "../controllers/transactionController";

const router = express.Router();

router.get("/all", controller.getAllTransactions);
router.get("/one/:id", controller.getTransactionById);
router.post("/add", controller.addTransaction);
router.delete("/delete/:id", controller.deleteTransactionById);

export default router;
