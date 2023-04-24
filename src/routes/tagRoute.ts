import express from "express";
import * as controller from "../controllers/tagController";
import authenticate from "../middlewares/authenticate";
import z from "zod";
import { validate } from "../middlewares/validation";
import { Types } from "mongoose";
import cookieRefresh from "../middlewares/cookieRefresh";

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

router.post(
  "/add",
  authenticate,
  cookieRefresh,
  validate(addSchema),
  controller.addTag
);
router.get("/getAllMy", authenticate, cookieRefresh, controller.getMyTags);
router.put(
  "/updateMy",
  authenticate,
  cookieRefresh,
  validate(updateSchema),
  controller.updateMyTag
);
router.delete(
  "/deleteMy/:id",
  authenticate,
  cookieRefresh,
  controller.deleteMyTagById
);

export default router;
