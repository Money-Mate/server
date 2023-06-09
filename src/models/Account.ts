import mongoose, { Schema, Model, Types } from "mongoose";

export interface IAccount {
  user: Types.ObjectId;
  name: string;
  iban?: string;
  reference: "name" | "iban";
  type: "giro" | "invest";
}

interface IAccountMethods {
  getReference(): string;
}

type AccountModel = Model<IAccount, {}, IAccountMethods>;

export const accountSchema = new Schema<
  IAccount,
  AccountModel,
  IAccountMethods
>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  iban: { type: String },
  reference: { type: String, enum: ["name", "iban"], required: true },
  type: { type: String, enum: ["giro", "invest"], required: true },
});

accountSchema.methods.getReference = function () {
  return this[this.reference];
};

const Account = mongoose.model<IAccount, AccountModel>(
  "Account",
  accountSchema
);

export default Account;
