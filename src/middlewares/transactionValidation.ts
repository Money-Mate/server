import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { transactionSchema } from "../models/Transaction";

const requiredFields = transactionSchema.requiredPaths();

const requiredFieldsValidation = requiredFields
  .filter((field) => field !== "user")
  .map((field) =>
    body(field)
      .exists()
      .withMessage(`${field} is required!`)
      .not()
      .isEmpty()
      .withMessage(`${field} needs a value!`)
  );

const validationRules = [
  ...requiredFieldsValidation,
  body("accountIBAN")
    .isString()
    .withMessage("accountIBAN needs to be a string!")
    .trim()
    .isLength({ min: 3 })
    .withMessage("accountIBAN must be at least 3 characters long!"),
  body("date")
    .isString()
    .withMessage("date needs to be a string!")
    .isDate({ format: "YYYY-MM-DD", strictMode: true, delimiters: ["-"] })
    .withMessage("date needs to be in format: YYYY-MM-DD!"),
  body("transactionText")
    .optional()
    .isString()
    .withMessage("transactionText needs to be a string!"),
  body("recipientName")
    .optional()
    .isString()
    .withMessage("recipientName needs to be a string!"),
  body("recipientIBAN")
    .optional()
    .isString()
    .withMessage("recipientIBAN needs to be a string!"),
  body("amount").isNumeric().withMessage("amount needs to be a number!"),
  body("currency")
    .optional()
    .isString()
    .withMessage("currency needs to be a string!"),
  body("title")
    .optional()
    .isString()
    .withMessage("title needs to be a string!"),
  body("comment")
    .optional()
    .isString()
    .withMessage("comment needs to be a string!"),
  // TODO: body("category").isString().withMessage("category needs to be a string!"),
  // TODO: body("subCategory").isString().withMessage("subCategory needs to be a string!"),
  body("statisticDate")
    .optional()
    .isString()
    .withMessage("statisticDate needs to be a string!")
    .isDate({ format: "YYYY-MM-DD", strictMode: true, delimiters: ["-"] })
    .withMessage("statisticDate needs to be in format: YYYY-MM-DD!"),
  // TODO: body("tags")
];

const validateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await Promise.all(validationRules.map((rule) => rule.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json(errors.mapped());
  // const errorMesseges = errors.array().map((err) => ({ [err.param]: err.msg }));
  // return res.status(400).json(errorMesseges);
};

export default validateTransaction;
