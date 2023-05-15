import express from "express";
import * as controller from "../controllers/budgetController";
import authenticate from "../middlewares/authenticate";
import z from "zod";
import { validate } from "../middlewares/validation";
import { Types } from "mongoose";
import cookieRefresh from "../middlewares/cookieRefresh";

const router = express.Router();

const addSchema = z.object({
  body: z.object({
    name: z.string(),
    amount: z.number(),
    categories: z
      .array(
        z.string().refine((id: string) => Types.ObjectId.isValid(id), {
          message: "invalid ObjectId",
        })
      )
      .optional(),
    subCategories: z
      .array(
        z.string().refine((id: string) => Types.ObjectId.isValid(id), {
          message: "invalid ObjectId",
        })
      )
      .optional(),
    tags: z
      .array(
        z.string().refine((id: string) => Types.ObjectId.isValid(id), {
          message: "invalid ObjectId",
        })
      )
      .optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    budgetId: z
      .string({
        invalid_type_error: "accountId needs to be a string",
        required_error: "accountId is required",
      })
      .refine((id: string) => Types.ObjectId.isValid(id), {
        message: "invalid ObjectId",
      }),
    data: z.object({
      name: z.string().optional(),
      amount: z.number().optional(),
      categories: z
        .array(
          z.string().refine((id: string) => Types.ObjectId.isValid(id), {
            message: "invalid ObjectId",
          })
        )
        .optional(),
      subCategories: z
        .array(
          z.string().refine((id: string) => Types.ObjectId.isValid(id), {
            message: "invalid ObjectId",
          })
        )
        .optional(),
      tags: z
        .array(
          z.string().refine((id: string) => Types.ObjectId.isValid(id), {
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
  controller.addBudget
);
router.get("/getMy", authenticate, cookieRefresh, controller.getMyBudget);
router.put(
  "/updateMy",
  authenticate,
  cookieRefresh,
  validate(updateSchema),
  controller.updateMyBudget
);
router.delete(
  "/deleteMy/:id",
  authenticate,
  cookieRefresh,
  controller.deleteMyBudget
);

export default router;
