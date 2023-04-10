import mongoose, { Schema, Model, Types } from "mongoose";

interface IRecipient {
  user: Types.ObjectId;
  name: string;
  nameAliases?: string[];
  usedInTransactions?: Types.ObjectId[];
  usedIBANs?: string[];
}

type RecipientModel = Model<IRecipient>;

const recipientSchema = new Schema<IRecipient, RecipientModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  nameAliases: { type: [String] },
  usedInTransactions: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  usedIBANs: { type: [String] },
});

const Recipient = mongoose.model<IRecipient, RecipientModel>(
  "Recipient",
  recipientSchema
);

export default Recipient;
