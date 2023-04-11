import express from "express";
import * as controller from "../controllers/transactionController";
import authenticate from "../middlewares/authenticate";
import isAdmin from "../middlewares/isAdmin";

const router = express.Router();

router.post("/add", authenticate, controller.addTransaction);
router.get("/getMy", authenticate, controller.getMyTransactions);
router.put("/updateMy", authenticate, controller.updateMyTransaction);
router.delete("/deleteMy/:id", authenticate, controller.deleteMyTransaction);

router.get("/all", authenticate, isAdmin, controller.getAllTransactions);
router.get("/one/:id", authenticate, isAdmin, controller.getTransactionById);
router.delete(
  "/delete/:id",
  authenticate,
  isAdmin,
  controller.deleteTransactionById
);
router.post("/addMany", authenticate, isAdmin, controller.createMany);

export default router;
