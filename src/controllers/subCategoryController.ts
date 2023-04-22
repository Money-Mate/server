import SubCategory, { ISubCategory } from "../models/SubCategory";
import { Request, Response } from "express";

export const addSubCategory = async (req: Request, res: Response) => {
  try {
    const newSubCategory: Partial<ISubCategory> = {};

    newSubCategory.user = res.locals.user._id;
    newSubCategory.name = req.body.name;
    newSubCategory.parentCategory = req.body.parentCategory;

    const data = await new SubCategory(newSubCategory).save();
    res.json({ msg: "SubCategory created" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getMySubCategorys = async (req: Request, res: Response) => {
  try {
    const data = await SubCategory.find({ user: res.locals.user._id }).select({
      user: false,
      __v: false,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getMySubCategoriesByCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await SubCategory.find({
      user: res.locals.user._id,
      parentCategory: req.params.id,
    }).select({ user: false, __v: false, parentCategory: false });
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
