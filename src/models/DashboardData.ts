import mongoose, { Schema, Model, Types } from "mongoose";

export interface IDashboardData {
  user: Types.ObjectId;
  bankBalance: number;
  saved: number;
  scheduledDebit: number;
  balanceEndOfMonth: number;
  incomeForThisMonth: number;
  expensesForThisMonth: number;
  emergencyFundPercent: number;
  wishlist: {
    [key: string]: number;
  };
  budgetlist: {
    [key: string]: { now: number; of: number; percent: number };
  };
  lastSixMonthsBalance: {
    labels: string[];
    data: number[];
  };
  lastSixMonthsIncomeAndExpenses: {
    labels: string[];
    data: { income: number[]; expenses: number[] };
  };
  lastSixMonthsExpensesByCategory: {
    category: string;
    subCategory: string;
    amount: number;
  }[];
}

type DashboardDataModel = Model<IDashboardData>;

const dashboardDataSchema = new Schema<IDashboardData, DashboardDataModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bankBalance: { type: Number, default: 0 },
  saved: { type: Number, default: 0 },
  scheduledDebit: { type: Number, default: 0 },
  balanceEndOfMonth: { type: Number, default: 0 },
  incomeForThisMonth: { type: Number, default: 0 },
  expensesForThisMonth: { type: Number, default: 0 },
  emergencyFundPercent: { type: Number, default: 0 },
  wishlist: { type: Object, default: {} },
  budgetlist: { type: Object, default: {} },
  lastSixMonthsBalance: {
    labels: {
      type: Array,
      default: ["Januar", "Februar", "März", "April", "Mai", "Juni"],
    },
    data: { type: Array, default: [0, 0, 0, 0, 0, 0] },
  },
  lastSixMonthsIncomeAndExpenses: {
    labels: {
      type: Array,
      default: ["Januar", "Februar", "März", "April", "Mai", "Juni"],
    },
    data: {
      type: Object,
      default: {
        income: [0, 0, 0, 0, 0, 0],
        expenses: [0, 0, 0, 0, 0, 0],
      },
    },
  },
  lastSixMonthsExpensesByCategory: {
    type: [Object],
    default: [{ category: "", subCategory: "", amount: 0 }],
  },
});

const DashboardData = mongoose.model<IDashboardData, DashboardDataModel>(
  "DashboardData",
  dashboardDataSchema
);

export default DashboardData;
