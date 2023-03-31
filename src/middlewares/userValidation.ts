import { body, validationResult } from "express-validator";
import { Request, Response,NextFunction } from "express";
import {userSchema}  from "../models/User";

const requiredFields = userSchema.requiredPaths();


const requiredFieldsValidation = requiredFields.map((field) =>
  body(field)
    .exists()
    .withMessage(`${field} is required!`)
    .not()
    .isEmpty()
    .withMessage(`${field} needs a value!`)
);

const userValidationRules = [
  ...requiredFieldsValidation,
  body("username")
    .isString()
    .withMessage("username needs to be a string!")
    .trim()
    .isLength({ min: 3 })
    .withMessage("username must be at least 3 characters long!"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("you have to enter a valid email-address!"),
  body("password").isString().withMessage("password needs to be a string!"),
];

const validateUser = async (req:Request , res:Response, next:NextFunction) => {
  await Promise.all(userValidationRules.map((rule) => rule.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json(errors.mapped());
  // const errorMesseges = errors.array().map((err) => ({ [err.param]: err.msg }));
  // return res.status(400).json(errorMesseges);
};

export default validateUser;
