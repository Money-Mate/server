import mongoose, { Schema, Model, Types } from "mongoose";

interface ITransaction {
  user: Types.ObjectId;
  account: Types.ObjectId;
  recipient: string;
  amount: number;
  date: Date;
}

type TransactionModel = Model<ITransaction>;

const transactionSchema = new Schema<ITransaction, TransactionModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  account: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  recipient: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
});

const Transaction = mongoose.model<ITransaction, TransactionModel>(
  "Transaction",
  transactionSchema
);

export default Transaction;
