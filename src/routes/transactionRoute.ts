import express from "express";
import * as controller from "../controllers/transactionController";
import authenticate from "../middlewares/authenticate";
import isAdmin from "../middlewares/isAdmin";
import z from "zod";
import { validate } from "../middlewares/validation";
import { Types } from "mongoose";
import isDate from "validator/lib/isDate";
import isIBAN from "validator/lib/isIBAN";
import cookieRefresh from "../middlewares/cookieRefresh";

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

const getMySchema = z.object({
  query: z.object({
    accounts: z.array(z.string()).optional(),
    amount: z.enum(["pos", "neg"]).optional(),
    categories: z
      .array(
        z.string().refine((id) => Types.ObjectId.isValid(id), {
          message: "invalid ObjectId",
        })
      )
      .optional(),
    subCategories: z
      .array(
        z.string().refine((id) => Types.ObjectId.isValid(id), {
          message: "invalid ObjectId",
        })
      )
      .optional(),
    date: z.enum(["asc", "desc"]).optional(),
    startDate: z
      .string()
      .refine((date) =>
        isDate(date, {
          format: "YYYY-MM-DD",
          strictMode: true,
          delimiters: ["-"],
        })
      )
      .optional(),
    endDate: z
      .string()
      .refine((date) =>
        isDate(date, {
          format: "YYYY-MM-DD",
          strictMode: true,
          delimiters: ["-"],
        })
      )
      .optional(),
    page: z.string().optional(),
    docsPerPage: z.string().optional(),
    // TODO: page and docsPerPage has to be number but query is string
  }),
});

router.post(
  "/add",
  authenticate,
  cookieRefresh,
  validate(addSchema),
  controller.addTransaction
);
router.get(
  "/getMy",
  authenticate,
  cookieRefresh,
  validate(getMySchema),
  controller.getMyTransactions
);
router.get(
  "/getFilterOptions",
  authenticate,
  cookieRefresh,
  controller.getFilterOptions
);
router.put(
  "/updateMy",
  authenticate,
  cookieRefresh,
  validate(updateSchema),
  controller.updateMyTransaction
);
router.delete(
  "/deleteMy/:id",
  authenticate,
  cookieRefresh,
  controller.deleteMyTransaction
);

router.get(
  "/all",
  authenticate,
  cookieRefresh,
  isAdmin,
  controller.getAllTransactions
);
router.get(
  "/one/:id",
  authenticate,
  cookieRefresh,
  isAdmin,
  controller.getTransactionById
);
router.delete(
  "/delete/:id",
  authenticate,
  cookieRefresh,
  isAdmin,
  controller.deleteTransactionById
);

export default router;
