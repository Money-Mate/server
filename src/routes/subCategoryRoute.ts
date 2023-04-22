import express from "express";
import * as controller from "../controllers/subCategoryController";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

router.post("/add", authenticate, controller.addSubCategory);
router.get("/getAllMy", authenticate, controller.getMySubCategorys);
router.get(
  "/getSubByCategory/:id",
  authenticate,
  controller.getMySubCategoriesByCategory
);
router.put("/updateMy", authenticate, controller.updateMySubCategory);
router.delete(
  "/deleteMy/:id",
  authenticate,
  controller.deleteMySubCategoryById
);

export default router;
