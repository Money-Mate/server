import Transaction from "../models/Transaction";
import { Request, Response } from "express";
import { ITransaction } from "../models/Transaction";
import Account from "../models/Account";
import Category from "../models/Category";
import SubCategory from "../models/SubCategory";

export const addTransaction = async (req: Request, res: Response) => {
  try {
    const { account, recipient, amount, date } = req.body;
    const data = await new Transaction({
      user: res.locals.user._id,
      account,
      recipient,
      amount,
      date: date + " 00:00:000Z",
    }).save();
    res.json({ msg: "Transaction created", data });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const createMany = async (req: Request, res: Response) => {
  try {
    // await Transaction.deleteMany({});
    const data: ITransaction[] = req.body;
    const datasets = await Promise.all(
      data.map(async (set) => {
        const result: Partial<ITransaction> = {};
        result.user = res.locals.user._id;
        result.account = await Account.findOne({
          user: res.locals.user._id,
          iban: set.accountIBAN,
        }).then((res) => {
          if (res !== null) return res.id;
        });
        result.accountIBAN = set.accountIBAN;
        result.date = set.date;
        result.transactionText = set.transactionText;
        // result.recipient
        if (set.recipientName) result.recipientName = set.recipientName;
        if (set.recipientIBAN) result.recipientIBAN = set.recipientIBAN;
        result.amount = set.amount;
        result.currency = set.currency;
        result.title = set.title;
        if (set.comment) result.comment = set.comment;
        result.category = await Category.findOne({
          user: res.locals.user._id,
          name: set.category,
        }).then((res) => {
          if (res !== null) return res.id;
        });
        result.subCategory = await SubCategory.findOne({
          user: res.locals.user._id,
          name: set.subCategory,
        }).then((res) => {
          if (res !== null) return res.id;
        });
        return result;
      })
    );
    const accepted = await Transaction.insertMany(datasets);
    res.json(accepted);
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
