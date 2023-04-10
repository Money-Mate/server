import mongoose from "mongoose";
import { startingCategories } from "../constants/defaults";
import Category from "../models/Category";
import SubCategory from "../models/SubCategory";

export const categorySetup = async (stringId: string) => {
  const userId = new mongoose.Types.ObjectId(stringId);

  try {
    for (const category in startingCategories) {
      const newCategory = await new Category({
        user: userId,
        name: category,
      }).save();
      startingCategories[category].forEach(async (sub) => {
        await new SubCategory({
          user: userId,
          name: sub,
          parentCategory: newCategory.id,
        }).save();
      });
    }
  } catch (err) {
    console.log("error in categorySetup: ", err);
  }
};
