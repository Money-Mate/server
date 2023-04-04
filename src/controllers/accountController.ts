import Account from "../models/Account";
import { Request, Response } from "express";

export const addAccount = async (req: Request, res: Response) => {
  try {
    const { name, reference, iban } = req.body;
    const data = await new Account({
      user: res.locals.user._id,
      name,
      reference,
      iban,
    }).save();
    res.json({ msg: "Account created", data });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getMyAccounts = async (req: Request, res: Response) => {
  try {
    const data = await Account.find({ user: res.locals.user._id });
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
