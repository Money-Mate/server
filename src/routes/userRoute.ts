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

router.post("/login", controller.login);
router.post("/register", validate(addSchema), controller.register);
router.get("/logout", controller.logout);
router.get("/checkToken", authenticate, cookieRefresh, controller.checkToken);

router.get("/all", authenticate, isAdmin, controller.getAllUsers);
router.get("/one/:id", authenticate, isAdmin, controller.getUserById);
router.delete("/delete/:id", authenticate, isAdmin, controller.deleteUserById);

export default router;
