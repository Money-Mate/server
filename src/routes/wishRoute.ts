import express from "express";
import * as controller from "../controllers/wishController";
import authenticate from "../middlewares/authenticate";
import z from "zod";
import { validate } from "../middlewares/validation";
import { Types } from "mongoose";
import cookieRefresh from "../middlewares/cookieRefresh";

const router = express.Router();

const addSchema = z.object({
  body: z.object({ name: z.string().min(1), price: z.number() }),
});

const updateSchema = z.object({
  body: z.object({
    wishId: z.string().refine((id) => Types.ObjectId.isValid(id), {
      message: "invalid ObjectId",
    }),
    data: z.object({
      name: z.string().min(1).optional(),
      price: z.number().optional(),
    }),
  }),
});

router.post(
  "/add",
  authenticate,
  cookieRefresh,
  validate(addSchema),
  controller.addWish
);
router.get("/getAllMy", authenticate, cookieRefresh, controller.getMyWishes);
router.put(
  "/updateMy",
  authenticate,
  cookieRefresh,
  validate(updateSchema),
  controller.updateMyWish
);
router.delete(
  "/deleteMy/:id",
  authenticate,
  cookieRefresh,
  controller.deleteMyWish
);

export default router;
