import mongoose, { Schema, Model, Types } from "mongoose";

interface IRecipient {
  user: Types.ObjectId;
  name: string;
  usedInTransactions?: Types.ObjectId[];
  usedIBANs?: string[];
}

type RecipientModel = Model<IRecipient>;

const recipientSchema = new Schema<IRecipient, RecipientModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  usedInTransactions: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  usedIBANs: { type: Array },
});

const Recipient = mongoose.model<IRecipient, RecipientModel>(
  "Recipient",
  recipientSchema
);

export default Recipient;
