import mongoose, { Schema, Model, Types } from "mongoose";

export interface ITransaction {
  user: Types.ObjectId;
  account?: Types.ObjectId;
  accountIBAN: string;
  date: Date;
  transactionText?: string;
  recipient?: Types.ObjectId;
  recipientName?: string;
  recipientIBAN?: string;
  amount: number;
  currency: string;
  title?: string;
  comment?: string;
  category?: Types.ObjectId;
  subCategory?: Types.ObjectId;
  statisticDate?: Date;
  tags?: Types.ObjectId[];
}

type TransactionModel = Model<ITransaction>;

export const transactionSchema = new Schema<ITransaction, TransactionModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  account: { type: Schema.Types.ObjectId, ref: "Account" },
  accountIBAN: { type: String, required: true },
  date: { type: Date, required: true },
  transactionText: { type: String },
  recipient: { type: Schema.Types.ObjectId, ref: "Recipient" },
  recipientName: { type: String },
  recipientIBAN: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: "EUR" },
  title: { type: String },
  comment: { type: String },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  subCategory: { type: Schema.Types.ObjectId, ref: "SubCategory" },
  statisticDate: { type: Date },
  tags: { type: [{ type: Schema.Types.ObjectId, ref: "Tag" }] },
});

const Transaction = mongoose.model<ITransaction, TransactionModel>(
  "Transaction",
  transactionSchema
);

export default Transaction;
