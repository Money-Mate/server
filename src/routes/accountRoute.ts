import express from "express";
import * as controller from "../controllers/accountController";
import authenticate from "../middlewares/authenticate";
import isAdmin from "../middlewares/isAdmin";
import z from "zod";
import { validate } from "../middlewares/validation";
import isIBAN from "validator/lib/isIBAN";
import { Types } from "mongoose";
import cookieRefresh from "../middlewares/cookieRefresh";

const router = express.Router();

const addSchema = z.object({
  body: z.object({
    name: z.string({
      invalid_type_error: "name needs to be a string",
      required_error: "name is required",
    }),
    reference: z.enum(["name", "iban"], {
      required_error: "reference is required",
      invalid_type_error: "reference needs to be a string",
    }),
    iban: z
      .string({
        invalid_type_error: "iban needs to be a string",
      })
      .refine(isIBAN, { message: "not a valid IBAN" })
      .optional(),
    type: z.enum(["giro", "invest"], {
      required_error: "type is required",
      invalid_type_error: "type needs to be a string",
    }),
  }),
});

const updateSchema = z.object({
  body: z.object({
    accountId: z
      .string({
        invalid_type_error: "accountId needs to be a string",
        required_error: "accountId is required",
      })
      .refine((id: string) => Types.ObjectId.isValid(id), {
        message: "invalid ObjectId",
      }),
    data: z.object({
      name: z
        .string({
          invalid_type_error: "name needs to be a string",
          required_error: "name is required",
        })
        .optional(),
      reference: z
        .enum(["name", "iban"], {
          required_error: "reference is required",
          invalid_type_error: "reference needs to be a string",
        })
        .optional(),
      iban: z
        .string({
          invalid_type_error: "iban needs to be a string",
        })
        .refine(isIBAN, { message: "not a valid IBAN" })
        .optional(),
      type: z.enum(["giro", "invest"], {
        required_error: "type is required",
        invalid_type_error: "type needs to be a string",
      }),
    }),
  }),
});

router.post(
  "/add",
  authenticate,
  cookieRefresh,
  validate(addSchema),
  controller.addAccount
);
router.get("/getAllMy", authenticate, cookieRefresh, controller.getMyAccounts);
router.put(
  "/updateMy",
  authenticate,
  cookieRefresh,
  validate(updateSchema),
  controller.updateMyAccount
);
router.delete(
  "/deleteMy/:id",
  authenticate,
  cookieRefresh,
  controller.deleteMyAccountById
);

router.get(
  "/all",
  authenticate,
  cookieRefresh,
  isAdmin,
  controller.getAllAccounts
);

export default router;
