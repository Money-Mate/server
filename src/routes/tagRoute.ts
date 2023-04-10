import express from "express";
import * as controller from "../controllers/tagController";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

router.post("/add", authenticate, controller.addTag);
router.get("/getAllMy", authenticate, controller.getMyTags);
router.put("/updateMy", authenticate, controller.updateMyTag);
router.delete("/deleteMy/:id", authenticate, controller.deleteMyTagById);

export default router;
