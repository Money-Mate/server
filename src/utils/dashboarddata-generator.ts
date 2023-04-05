import DashboardData from "../models/DashboardData";
import { ITransaction } from "../models/Transaction";

export const writeDashboardDataOnNewTransaction = async (
  userId: string,
  doc: ITransaction
) => {
  const dashboard = await DashboardData.findOne({ user: userId });
  if (dashboard === null) {
    throw new Error("dashboard not found");
  }
  dashboard.balance += doc.amount;
  await dashboard.save();
};
