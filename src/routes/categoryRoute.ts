import express from "express";
import * as controller from "../controllers/categoryController";
import authenticate from "../middlewares/authenticate";
import z from "zod";
import { validate } from "../middlewares/validation";
import { Types } from "mongoose";

const router = express.Router();

const addSchema = z.object({
  body: z.object({ name: z.string() }),
});

const updateSchema = z.object({
  body: z.object({
    categoryId: z.string().refine((id) => Types.ObjectId.isValid(id), {
      message: "invalid ObjectId",
    }),
    data: z.object({ name: z.string() }),
  }),
});

router.post("/add", authenticate, validate(addSchema), controller.addCategory);
router.get("/getAllMy", authenticate, controller.getMyCategorys);
router.put(
  "/updateMy",
  authenticate,
  validate(updateSchema),
  controller.updateMyCategory
);
router.delete("/deleteMy/:id", authenticate, controller.deleteMyCategoryById);

export default router;
