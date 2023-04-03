import mongoose, { Schema, Model, Types } from "mongoose";

interface IDashboardData {
  user: Types.ObjectId;
  balance: number;
  saved: number;
  scheduledDebit: number;
  balanceEndOfMonth: number;
}

type DashboardDataModel = Model<IDashboardData>;

const dashboardDataSchema = new Schema<IDashboardData, DashboardDataModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, required: true },
  saved: { type: Number, required: true },
  scheduledDebit: { type: Number, required: true },
  balanceEndOfMonth: { type: Number, required: true },
});

const DashboardData = mongoose.model<IDashboardData, DashboardDataModel>(
  "DashboardData",
  dashboardDataSchema
);

export default DashboardData;
