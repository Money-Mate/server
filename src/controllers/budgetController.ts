import { Request, Response } from "express";
import { Budget, IBudget } from "../models/Budget";
import Category from "../models/Category";
import SubCategory from "../models/SubCategory";
import Tag from "../models/Tag";

export const addBudget = async (req: Request, res: Response) => {
  try {
    const newBudget: Partial<IBudget> = {};

    // required fields
    newBudget.user = res.locals.user._id;
    newBudget.name = req.body.name;
    newBudget.amount = req.body.amount;

    // optional fields
    if (req.body.categories) {
      const categories: string[] = req.body.categories;
      const allValid = categories.map(async (catId) => {
        const category = await Category.findOne({
          user: res.locals.user._id,
          _id: catId,
        });
        if (category === null) {
          const err = new Error("category does not exist");
          err.name = "custom";
          throw err;
        }
      });
      await Promise.all(allValid);
      newBudget.categories = req.body.categories;
    }

    if (req.body.subCategories) {
      const subCategories: string[] = req.body.subCategories;
      const allValid = subCategories.map(async (subCatId) => {
        const subCategory = await SubCategory.findOne({
          user: res.locals.user._id,
          _id: subCatId,
        });
        if (subCategory === null) {
          const err = new Error("subCategory does not exist");
          err.name = "custom";
          throw err;
        }
      });
      await Promise.all(allValid);
      newBudget.subCategories = req.body.subCategories;
    }

    if (req.body.tags) {
      const tags: string[] = req.body.tags;
      const allValid = tags.map(async (tagId) => {
        const tag = await Tag.findOne({
          user: res.locals.user._id,
          _id: tagId,
        });
        if (tag === null) {
          const err = new Error("tag does not exist");
          err.name = "custom";
          throw err;
        }
      });
      await Promise.all(allValid);
      newBudget.tags = req.body.tags;
    }

    const data = await new Budget(newBudget).save();
    res.json({ msg: "Budget created", data });
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      if (err.name === "custom") {
        return res.status(400).json({ msg: err.message });
      }
    }
    res.json({ msg: "server error" });
  }
};

export const getMyBudget = async (req: Request, res: Response) => {
  try {
    // const data = await Budget.find({ user: res.locals.user._id }).select({
    //   user: false,
    //   __v: false,
    // });
    const data = await Budget.aggregate([
      { $match: { user: res.locals.user._id } },
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories",
          pipeline: [{ $project: { user: false, __v: false } }],
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategories",
          foreignField: "_id",
          as: "subCategories",
          pipeline: [
            {
              $project: {
                user: false,
                __v: false,
                parentCategory: false,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "tags",
          pipeline: [{ $project: { user: false, __v: false } }],
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const updateMyBudget = async (req: Request, res: Response) => {
  try {
    const data = await Budget.updateOne(
      { user: res.locals.user._id, _id: req.body.budgetId },
      { ...req.body.data }
    );
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const deleteMyBudget = async (req: Request, res: Response) => {
  try {
    const data = await Budget.deleteOne({
      user: res.locals.user._id,
      _id: req.params.id,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
