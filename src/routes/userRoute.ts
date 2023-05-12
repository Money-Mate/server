import express from "express";
import * as controller from "../controllers/userController";
import authenticate from "../middlewares/authenticate";
import isAdmin from "../middlewares/isAdmin";
import z from "zod";
import { validate } from "../middlewares/validation";
import cookieRefresh from "../middlewares/cookieRefresh";

const router = express.Router();

const addSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3),
    email: z.string().email(),
    password: z.string(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3).optional(),
    email: z.string().email().optional(),
    financialOptions: z
      .object({
        amountEmergencyFund: z.number().optional(),
        splitIncome: z
          .object({ needs: z.number(), wants: z.number(), savings: z.number() })
          .optional(),
      })
      .optional(),
  }),
});

router.post("/login", controller.login);
router.post("/register", validate(addSchema), controller.register);
router.get("/logout", controller.logout);
router.get("/checkToken", authenticate, cookieRefresh, controller.checkToken);
router.get("/getUserData", authenticate, controller.getUserData);
router.get(
  "/updateUser",
  authenticate,
  validate(updateSchema),
  controller.updateUserData
);

router.get("/all", authenticate, isAdmin, controller.getAllUsers);
router.get("/one/:id", authenticate, isAdmin, controller.getUserById);
router.delete("/delete/:id", authenticate, isAdmin, controller.deleteUserById);

export default router;
