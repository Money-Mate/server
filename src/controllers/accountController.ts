import Account, { IAccount } from "../models/Account";
import { Request, Response } from "express";

export const addAccount = async (req: Request, res: Response) => {
  try {
    const newAccount: Partial<IAccount> = {};
    // required fields
    newAccount.user = res.locals.user._id;
    newAccount.name = req.body.name;
    newAccount.reference = req.body.reference;

    // optional fields
    if (req.body.iban) newAccount.iban = req.body.iban;

    const data = await new Account(newAccount).save();
    res.json({ msg: "Account created", data });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getMyAccounts = async (req: Request, res: Response) => {
  try {
    const data = await Account.find({ user: res.locals.user._id }).select({
      user: false,
      __v: false,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const data = await Account.find();
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const updateMyAccount = async (req: Request, res: Response) => {
  try {
    const data = await Account.updateOne(
      { user: res.locals.user._id, _id: req.body.accountId },
      { ...req.body.data }
    );
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const deleteMyAccountById = async (req: Request, res: Response) => {
  try {
    const data = await Account.deleteOne({
      user: res.locals.user._id,
      _id: req.params.id,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
