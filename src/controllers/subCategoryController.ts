import SubCategory from "../models/SubCategory";
import { Request, Response } from "express";

export const addSubCategory = async (req: Request, res: Response) => {
  try {
    const { name, parentCategory } = req.body;
    const data = await new SubCategory({
      user: res.locals.user._id,
      name,
      parentCategory,
    }).save();
    res.json({ msg: "SubCategory created", data });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getMySubCategorys = async (req: Request, res: Response) => {
  try {
    const data = await SubCategory.find({ user: res.locals.user._id });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const updateMySubCategory = async (req: Request, res: Response) => {
  try {
    const data = await SubCategory.updateOne(
      { user: res.locals.user._id, _id: req.body.subCategoryId },
      { ...req.body.data }
    );
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const deleteMySubCategoryById = async (req: Request, res: Response) => {
  try {
    const data = await SubCategory.deleteOne({
      user: res.locals.user._id,
      _id: req.params.id,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
