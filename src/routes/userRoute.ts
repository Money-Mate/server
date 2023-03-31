import express from "express";
import * as controller from "../controllers/userController";
import authenticate from "../middlewares/authenticate";
import validateUser from "../middlewares/userValidation";

const router = express.Router();

router.post("/login", controller.login);
router.post("/register", validateUser, controller.register);
router.get("/all", authenticate, controller.getAllUsers);
router.get("/one/:id", controller.getUserById);
router.delete("/delete/:id", controller.deleteUserById);


export default router;
