import mongoose, { Schema, Model, Types } from "mongoose";
import { writeDashboardDataOnNewTransaction } from "../utils/dashboarddata-generator";

export interface ITransaction {
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

transactionSchema.post("save", async function (doc) {
  await writeDashboardDataOnNewTransaction(doc.user.toString(), doc);
});

const Transaction = mongoose.model<ITransaction, TransactionModel>(
  "Transaction",
  transactionSchema
);

export default Transaction;
