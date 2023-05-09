import Category from "../models/Category";
import { Request, Response } from "express";
import SubCategory from "../models/SubCategory";
import mongoose from "mongoose";

export const addCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const data = await new Category({
      user: res.locals.user._id,
      name,
    }).save();
    res.json({ msg: "Category created", data });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getMyCategorys = async (req: Request, res: Response) => {
  try {
    const data = await Category.find({ user: res.locals.user._id });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getMyCategoryTree = async (req: Request, res: Response) => {
  try {
    interface IData {
      id: mongoose.Types.ObjectId;
      name: string;
      subCategories?: { id: mongoose.Types.ObjectId; name: string }[];
    }
    const data: IData[] = [];
    const categories = await Category.find({
      user: res.locals.user._id,
    }).select({ user: false, __v: false });
    categories.map((category) =>
      data.push({ id: category.id, name: category.name })
    );
    const result = data.map(async (category) => {
      const resu = category;
      const subCategories = await SubCategory.find({
        user: res.locals.user._id,
        parentCategory: category.id,
      }).select({ user: false, parentCategory: false, __v: false });

      resu.subCategories = subCategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
      }));
      return resu;
    });

    res.json(await Promise.all(result));
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const updateMyCategory = async (req: Request, res: Response) => {
  try {
    const data = await Category.updateOne(
      { user: res.locals.user._id, _id: req.body.categoryId },
      { ...req.body.data }
    );
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const deleteMyCategoryById = async (req: Request, res: Response) => {
  try {
    const data = await Category.deleteOne({
      user: res.locals.user._id,
      _id: req.params.id,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
