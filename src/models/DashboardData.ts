import mongoose, { Schema, Model, Types } from "mongoose";

export interface IDashboardData {
  user: Types.ObjectId;
  bankBalance: number;
  saved: number;
  scheduledDebit: number;
  balanceEndOfMonth: number;
  lastSixMonthsBalance: {
    labels: string[];
    data: number[];
  };
}

type DashboardDataModel = Model<IDashboardData>;

const dashboardDataSchema = new Schema<IDashboardData, DashboardDataModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bankBalance: { type: Number, default: 0 },
  saved: { type: Number, default: 0 },
  scheduledDebit: { type: Number, default: 0 },
  balanceEndOfMonth: { type: Number, default: 0 },
  lastSixMonthsBalance: {
    labels: {
      type: Array,
      default: ["Januar", "Februar", "März", "April", "Mai", "Juni"],
    },
    data: { type: Array, default: [0, 0, 0, 0, 0, 0] },
  },
});

const DashboardData = mongoose.model<IDashboardData, DashboardDataModel>(
  "DashboardData",
  dashboardDataSchema
);

export default DashboardData;
