import Transaction from "../models/Transaction";
import { Request, Response } from "express";


export const addTransaction = async (req:Request, res:Response) => {
  try {
    const data = await new Transaction(req.body).save();
    res.json({ msg: "Transaction created", data });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getAllTransactions = async (req:Request, res:Response) => {
  try {
    const data = await Transaction.find();
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getTransactionById = async (req:Request, res:Response) => {
  try {
    const data = await Transaction.findById(req.params.id);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const deleteTransactionById = async (req:Request, res:Response) => {
  try {
    const data = await Transaction.findByIdAndDelete(req.params.id);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
