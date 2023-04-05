import mongoose, { Schema, Model, Types } from "mongoose";

export interface IDashboardData {
  user: Types.ObjectId;
  balance: number;
  saved: number;
  scheduledDebit: number;
  balanceEndOfMonth: number;
}

type DashboardDataModel = Model<IDashboardData>;

const dashboardDataSchema = new Schema<IDashboardData, DashboardDataModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, default: 0 },
  saved: { type: Number, default: 0 },
  scheduledDebit: { type: Number, default: 0 },
  balanceEndOfMonth: { type: Number, default: 0 },
});

const DashboardData = mongoose.model<IDashboardData, DashboardDataModel>(
  "DashboardData",
  dashboardDataSchema
);

export default DashboardData;
