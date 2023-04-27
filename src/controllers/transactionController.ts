import z from "zod";
import Category from "../models/Category";
import SubCategory from "../models/SubCategory";
import Transaction, { ITransaction } from "../models/Transaction";
import { Request, Response } from "express";
import mongoose from "mongoose";

export const addTransaction = async (req: Request, res: Response) => {
  try {
    const newTransaction: Partial<ITransaction> = {};

    // required fields
    newTransaction.user = res.locals.user._id;
    newTransaction.accountIBAN = req.body.accountIBAN;
    newTransaction.date = new Date(req.body.date + " 00:00:000Z");
    newTransaction.amount = req.body.amount;
    newTransaction.currency = req.body.currency;

    // optional fields
    // TODO: add account
    if (req.body.transactionText)
      newTransaction.transactionText = req.body.transactionText;
    // TODO: add recipient
    if (req.body.recipientName)
      newTransaction.recipientName = req.body.recipientName;
    if (req.body.recipientIBAN)
      newTransaction.recipientIBAN = req.body.recipientIBAN;
    if (req.body.title) newTransaction.title = req.body.title;
    if (req.body.comment) newTransaction.comment = req.body.comment;
    if (req.body.category) {
      const category = await Category.findOne({
        user: res.locals.user._id,
        _id: req.body.category,
      });
      if (category === null) {
        const err = new Error("category does not exist");
        err.name = "custom";
        throw err;
      }
      newTransaction.category = category?.id;
    }
    if (req.body.subCategory) {
      let subCategory = await SubCategory.findOne({
        user: res.locals.user._id,
        _id: req.body.subCategory,
      });
      if (subCategory === null) {
        const err = new Error("subCategory does not exist");
        err.name = "custom";
        throw err;
      }
      subCategory = await SubCategory.findOne({
        user: res.locals.user._id,
        _id: req.body.subCategory,
        parentCategory: req.body.category,
      });
      if (subCategory === null) {
        const err = new Error("subCategory has wrong parentCategory");
        err.name = "custom";
        throw err;
      }
      newTransaction.subCategory = subCategory?.id;
    }
    if (req.body.statisticDate)
      newTransaction.statisticDate = new Date(
        req.body.statisticDate + " 00:00:000Z"
      );
    // TODO: add tags

    const data = await new Transaction(newTransaction).save();
    res.json({ msg: "Transaction created", data });
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      if (err.name === "custom") {
        return res.status(400).json({ msg: err.message });
      }
    }
    res.status(500).json({ msg: "server error" });
  }
};

export const getMyTransactions = async (req: Request, res: Response) => {
  try {
    const agg = Transaction.aggregate([
      { $match: { user: res.locals.user._id } },
      {
        $addFields: {
          sortDate: {
            $cond: [
              { $ifNull: ["$statisticDate", false] },
              "$statisticDate",
              "$date",
            ],
          },
        },
      },
    ]);

    // filters
    if (req.query.startDate) {
      const startDate = new Date(req.query.startDate + " 00:00:000Z");
      agg.append({ $match: { sortDate: { $gte: startDate } } });
    }
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate + " 00:00:000Z");
      agg.append({ $match: { sortDate: { $lte: endDate } } });
    }
    if (req.query.accounts && req.query.accounts.length) {
      agg.append({ $match: { accountIBAN: { $in: req.query.accounts } } });
    }
    if (req.query.amount) {
      if (req.query.amount === "pos") {
        agg.append({ $match: { amount: { $gte: 0 } } });
      }
      if (req.query.amount === "neg") {
        agg.append({ $match: { amount: { $lte: 0 } } });
      }
    }
    if (req.query.categories && req.query.categories.length) {
      const categories = z.array(z.string()).parse(req.query.categories);
      const ids = categories.map((id) => new mongoose.Types.ObjectId(id));
      agg.append({
        $match: { category: { $in: ids } },
      });
    }
    if (req.query.subCategories && req.query.subCategories.length) {
      const subCategories = z.array(z.string()).parse(req.query.subCategories);
      const ids = subCategories.map((id) => new mongoose.Types.ObjectId(id));
      agg.append({ $match: { subCategory: { $in: ids } } });
    }

    // sorting
    switch (req.query.date) {
      case "asc":
        agg.append({ $sort: { date: 1 } });
        break;
      case "desc":
        agg.append({ $sort: { date: -1 } });
        break;
      default:
        agg.append({ $sort: { sortDate: -1 } });
        break;
    }

    // remove unwanted fields
    agg.append({ $project: { user: false, sortDate: false, __v: false } });

    // pagination
    const docsPerPage = Number(req.query.docsPerPage) || 30;
    let page = 1;
    if (req.query.page) {
      page = Number(req.query.page);
    }
    const skip = page === 1 ? 0 : docsPerPage * (page - 1);
    agg.append({
      $facet: {
        data: [{ $skip: skip }, { $limit: docsPerPage }],
        docsCount: [{ $count: "docsCount" }],
      },
    });

    const data = await agg.exec();
    res.json({
      page: page,
      totalDocs: data[0].docsCount[0].docsCount,
      data: data[0].data,
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const data: Partial<{
      accounts: string[];
      dateRange: { startDate: string; endDate: string };
      date: string[];
      amount: string[];
      categories: string[];
      subCategories: string[];
    }> = {};
    data.accounts = await Transaction.aggregate([
      { $match: { user: res.locals.user._id } },
      { $group: { _id: "$accountIBAN" } },
    ]).then((res) => res.map((item) => item._id));
    data.categories = await Transaction.aggregate([
      { $match: { user: res.locals.user._id } },
      { $group: { _id: "$category" } },
    ])
      .then((res) => res.filter((item) => item._id !== null))
      .then((res) => res.map((item) => item._id));
    data.subCategories = await Transaction.aggregate([
      { $match: { user: res.locals.user._id } },
      { $group: { _id: "$subCategory" } },
    ])
      .then((res) => res.filter((item) => item._id !== null))
      .then((res) => res.map((item) => item._id));

    data.dateRange = { startDate: "", endDate: "" };
    data.date = ["desc", "asc"];
    data.amount = ["pos", "neg"];
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const updateMyTransaction = async (req: Request, res: Response) => {
  try {
    if (req.body.data.category) {
      const category = await Category.findOne({
        user: res.locals.user._id,
        _id: req.body.data.category,
      });
      if (category === null) {
        const err = new Error("category does not exist");
        err.name = "custom";
        throw err;
      }
    }

    if (req.body.data.subCategory) {
      const subCategory = await SubCategory.findOne({
        user: res.locals.user._id,
        _id: req.body.data.subCategory,
      });
      if (subCategory === null) {
        const err = new Error("subCategory does not exist");
        err.name = "custom";
        throw err;
      }
    }

    const categories: { category?: string; subCategory?: string | null } = {};

    if (req.body.data.category && req.body.data.subCategory) {
      const subCategory = await SubCategory.findOne({
        user: res.locals.user._id,
        _id: req.body.data.subCategory,
        parentCategory: req.body.data.category,
      });
      if (subCategory === null) {
        const err = new Error("subCategory has wrong parentCategory");
        err.name = "custom";
        throw err;
      }
      categories.category = req.body.data.category;
      categories.subCategory = req.body.data.subCategory;
    } else if (!req.body.data.category && req.body.data.subCategory) {
      const oldTransaction = await Transaction.findOne({
        user: res.locals.user._id,
        _id: req.body.transactionId,
      });
      if (oldTransaction === null) {
        const err = new Error("transactionId does not exist");
        err.name = "custom";
        throw err;
      }
      const subCategory = await SubCategory.findOne({
        user: res.locals.user._id,
        _id: req.body.data.subCategory,
        parentCategory: oldTransaction.category,
      });
      if (subCategory === null) {
        const err = new Error("subCategory has wrong parentCategory");
        err.name = "custom";
        throw err;
      }
      categories.category = oldTransaction.category?.toString();
      categories.subCategory = req.body.data.subCategory;
    } else if (req.body.data.category && !req.body.data.subCategory) {
      const category = await Category.findOne({
        user: res.locals.user._id,
        _id: req.body.data.category,
      });
      if (category === null) {
        const err = new Error("category does not exist");
        err.name = "custom";
        throw err;
      }
      categories.category = req.body.data.category;
      categories.subCategory = null;
    }

    const updatedTransaction = {
      ...req.body.data,
      ...(req.body.data.date && { date: req.body.data.date + " 00:00:000Z" }),
      ...categories,
    };

    const data = await Transaction.findOneAndUpdate(
      { user: res.locals.user._id, _id: req.body.transactionId },
      updatedTransaction,
      { returnDocument: "after" }
    );
    res.json(data);
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

export const deleteMyTransaction = async (req: Request, res: Response) => {
  try {
    const data = await Transaction.deleteOne({
      user: res.locals.user._id,
      _id: req.params.id,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const data = await Transaction.find();
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const data = await Transaction.findById(req.params.id);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const deleteTransactionById = async (req: Request, res: Response) => {
  try {
    const data = await Transaction.findByIdAndDelete(req.params.id);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
