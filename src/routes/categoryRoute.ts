import express from "express";
import * as controller from "../controllers/categoryController";
import authenticate from "../middlewares/authenticate";
import z from "zod";
import { validate } from "../middlewares/validation";
import { Types } from "mongoose";
import cookieRefresh from "../middlewares/cookieRefresh";

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

router.post(
  "/add",
  authenticate,
  cookieRefresh,
  validate(addSchema),
  controller.addCategory
);
router.get("/getAllMy", authenticate, cookieRefresh, controller.getMyCategorys);
router.get(
  "/getMyCategoryTree",
  authenticate,
  cookieRefresh,
  controller.getMyCategoryTree
);
router.put(
  "/updateMy",
  authenticate,
  cookieRefresh,
  validate(updateSchema),
  controller.updateMyCategory
);
router.delete(
  "/deleteMy/:id",
  authenticate,
  cookieRefresh,
  controller.deleteMyCategoryById
);

export default router;
