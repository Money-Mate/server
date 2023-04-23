import express from "express";
import * as controller from "../controllers/transactionController";
import authenticate from "../middlewares/authenticate";
import isAdmin from "../middlewares/isAdmin";
import z from "zod";
import { validate } from "../middlewares/validation";
import { Types } from "mongoose";
import isDate from "validator/lib/isDate";
import isIBAN from "validator/lib/isIBAN";

const router = express.Router();

const addSchema = z.object({
  body: z.object({
    // required fields
    accountIBAN: z.string().refine(isIBAN, { message: "not a valid IBAN" }),
    date: z.string().refine((date) =>
      isDate(date, {
        format: "YYYY-MM-DD",
        strictMode: true,
        delimiters: ["-"],
      })
    ),
    amount: z.number(),
    currency: z.string(),

    // optional fields
    transactionText: z.string().optional(),
    recipientName: z.string().optional(),
    recipientIBAN: z
      .string()
      .refine(isIBAN, { message: "not a valid IBAN" })
      .optional(),
    title: z.string().optional(),
    comment: z.string().optional(),
    category: z
      .string()
      .refine((id) => Types.ObjectId.isValid(id), {
        message: "invalid ObjectId",
      })
      .optional(),
    subCategory: z
      .string()
      .refine((id) => Types.ObjectId.isValid(id), {
        message: "invalid ObjectId",
      })
      .optional(),
    statisticDate: z
      .string()
      .refine((date) =>
        isDate(date, {
          format: "YYYY-MM-DD",
          strictMode: true,
          delimiters: ["-"],
        })
      )
      .optional(),
    // tags: z
    //   .array(
    //     z.string().refine((id: string) => Types.ObjectId.isValid(id), {
    //       message: "invalid ObjectId",
    //     })
    //   )
    //   .optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    transactionId: z.string().refine((id) => Types.ObjectId.isValid(id), {
      message: "invalid ObjectId",
    }),
    data: z.object({
      accountIBAN: z
        .string()
        .refine(isIBAN, { message: "not a valid IBAN" })
        .optional(),
      date: z
        .string()
        .refine((date) =>
          isDate(date, {
            format: "YYYY-MM-DD",
            strictMode: true,
            delimiters: ["-"],
          })
        )
        .optional(),
      amount: z.number().optional(),
      currency: z.string().optional(),
      transactionText: z.string().optional(),
      recipientName: z.string().optional(),
      recipientIBAN: z
        .string()
        .refine(isIBAN, { message: "not a valid IBAN" })
        .optional(),
      title: z.string().optional(),
      comment: z.string().optional(),
      category: z
        .string()
        .refine((id) => Types.ObjectId.isValid(id), {
          message: "invalid ObjectId",
        })
        .optional(),
      subCategory: z
        .string()
        .refine((id) => Types.ObjectId.isValid(id), {
          message: "invalid ObjectId",
        })
        .optional(),
      statisticDate: z
        .string()
        .refine((date) =>
          isDate(date, {
            format: "YYYY-MM-DD",
            strictMode: true,
            delimiters: ["-"],
          })
        )
        .optional(),
      // tags: z
      //   .array(
      //     z.string().refine((id: string) => Types.ObjectId.isValid(id), {
      //       message: "invalid ObjectId",
      //     })
      //   )
      //   .optional(),
    }),
  }),
});

router.post(
  "/add",
  authenticate,
  validate(addSchema),
  controller.addTransaction
);
router.get("/getMy", authenticate, controller.getMyTransactions);
router.put(
  "/updateMy",
  authenticate,
  validate(updateSchema),
  controller.updateMyTransaction
);
router.delete("/deleteMy/:id", authenticate, controller.deleteMyTransaction);

router.get("/all", authenticate, isAdmin, controller.getAllTransactions);
router.get("/one/:id", authenticate, isAdmin, controller.getTransactionById);
router.delete(
  "/delete/:id",
  authenticate,
  isAdmin,
  controller.deleteTransactionById
);

export default router;
