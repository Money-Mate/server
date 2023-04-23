import express from "express";
import * as controller from "../controllers/tagController";
import authenticate from "../middlewares/authenticate";
import z from "zod";
import { validate } from "../middlewares/validation";
import { Types } from "mongoose";

const router = express.Router();

const addSchema = z.object({ body: z.object({ name: z.string() }) });

const updateSchema = z.object({
  body: z.object({
    tagId: z.string().refine((id) => Types.ObjectId.isValid(id), {
      message: "invalid ObjectId",
    }),
    data: z.object({ name: z.string().optional() }),
  }),
});

router.post("/add", authenticate, validate(addSchema), controller.addTag);
router.get("/getAllMy", authenticate, controller.getMyTags);
router.put(
  "/updateMy",
  authenticate,
  validate(updateSchema),
  controller.updateMyTag
);
router.delete("/deleteMy/:id", authenticate, controller.deleteMyTagById);

export default router;
