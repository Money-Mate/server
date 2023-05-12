import express from "express";
import * as controller from "../controllers/wishlistController";
import authenticate from "../middlewares/authenticate";
import z from "zod";
import { validate } from "../middlewares/validation";
import { Types } from "mongoose";
import cookieRefresh from "../middlewares/cookieRefresh";

const router = express.Router();

const addSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    wishes: z
      .array(
        z.string().refine((id) => Types.ObjectId.isValid(id), {
          message: "invalid ObjectId",
        })
      )
      .optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    wishlistId: z.string().refine((id) => Types.ObjectId.isValid(id), {
      message: "invalid ObjectId",
    }),
    data: z.object({
      name: z.string().min(1).optional(),
      wishes: z
        .array(
          z.string().refine((id) => Types.ObjectId.isValid(id), {
            message: "invalid ObjectId",
          })
        )
        .optional(),
    }),
  }),
});

router.post(
  "/add",
  authenticate,
  cookieRefresh,
  validate(addSchema),
  controller.addWishlist
);
router.get("/getAllMy", authenticate, cookieRefresh, controller.getMyWishlists);
router.put(
  "/updateMy",
  authenticate,
  cookieRefresh,
  validate(updateSchema),
  controller.updateMyWishlist
);
router.delete(
  "/deleteMy/:id",
  authenticate,
  cookieRefresh,
  controller.deleteMyWishlist
);

export default router;
