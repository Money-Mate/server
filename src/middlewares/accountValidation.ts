import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { accountSchema } from "../models/Account";

const requiredFields = accountSchema.requiredPaths();

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
  body("name")
    .isString()
    .withMessage("name needs to be a string!")
    .trim()
    .isLength({ min: 3 })
    .withMessage("name must be at least 3 characters long!"),
  body("reference")
    .isString()
    .withMessage("reference needs to be a string!")
    .isIn(["name", "iban"])
    .withMessage("reference must be 'name' or 'iban'!"),
  body("iban")
    .optional()
    .isString()
    .withMessage("iban needs to be a string!")
    .trim()
    .isIBAN()
    .withMessage("not a valid IBAN!"),
];

const validateAccount = async (
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

export default validateAccount;
