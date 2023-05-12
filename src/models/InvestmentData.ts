import mongoose, { Schema, Model, Types } from "mongoose";

export interface IInvestmentData {
  user: Types.ObjectId;
  name: string;
  value: number;
  amount: number;
  buyIn: number;
  dividend: number;
  type: "Stocks" | "Crypto" | "Real Estate" | "Commodities";
  symbol: string;
}

type InvestmentDataModel = Model<IInvestmentData>;

const investmentDataSchema = new Schema<IInvestmentData, InvestmentDataModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  value: { type: Number, required: true },
  amount: { type: Number, required: true },
  buyIn: { type: Number, required: true },
  dividend: { type: Number },
  type: { type: String, required: true },
  symbol: { type: String },
});

const InvestmentData = mongoose.model<IInvestmentData, InvestmentDataModel>(
  "InvestmentData",
  investmentDataSchema
);

export default InvestmentData;
