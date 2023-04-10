import express from "express";
import * as controller from "../controllers/categoryController";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

router.post("/add", authenticate, controller.addCategory);
router.get("/getAllMy", authenticate, controller.getMyCategorys);
router.put("/updateMy", authenticate, controller.updateMyCategory);
router.delete("/deleteMy/:id", authenticate, controller.deleteMyCategoryById);

export default router;
