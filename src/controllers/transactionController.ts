import Category from "../models/Category";
import SubCategory from "../models/SubCategory";
import Transaction, { ITransaction } from "../models/Transaction";
import { Request, Response } from "express";

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
        name: req.body.category,
      });
      newTransaction.category = category?.id;
    }
    if (req.body.subCategory) {
      const subCategory = await SubCategory.findOne({
        user: res.locals.user._id,
        name: req.body.subCategory,
      });
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
    res.json({ msg: "server error" });
  }
};

export const getMyTransactions = async (req: Request, res: Response) => {
  try {
    const query = Transaction.find({ user: res.locals.user._id }).select({
      user: false,
      __v: false,
    });
    if (req.body.accountId) {
      query.find({ account: req.body.accountId });
    }
    const data = await query.exec();
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const updateMyTransaction = async (req: Request, res: Response) => {
  try {
    const data = await Transaction.findOneAndUpdate(
      { user: res.locals.user._id, _id: req.body.transactionId },
      {
        ...req.body.data,
        ...(req.body.data.date && { date: req.body.data.date + " 00:00:000Z" }),
      },
      { returnDocument: "after" }
    );
    res.json(data);
  } catch (err) {
    console.log(err);
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
