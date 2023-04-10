import Category from "../models/Category";
import { Request, Response } from "express";

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
