import express from "express";
import * as controller from "../controllers/userController";
import authenticate from "../middlewares/authenticate";
import validateUser from "../middlewares/userValidation";
import isAdmin from "../middlewares/isAdmin";

const router = express.Router();

router.post("/login", controller.login);
router.post("/register", validateUser, controller.register);
router.get("/logout", controller.logout);
router.get("/checkToken", authenticate, controller.checkToken);

router.get("/all", authenticate, isAdmin, controller.getAllUsers);
router.get("/one/:id", authenticate, isAdmin, controller.getUserById);
router.delete("/delete/:id", authenticate, isAdmin, controller.deleteUserById);

export default router;
