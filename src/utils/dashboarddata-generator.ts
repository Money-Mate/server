import mongoose from "mongoose";
import DashboardData from "../models/DashboardData";
import Transaction, { ITransaction } from "../models/Transaction";
import User from "../models/User";

export const writeDashboardDataOnNewTransaction = async (
  userId: string,
  doc: ITransaction
) => {
  const dashboard = await DashboardData.findOne({ user: userId });
  if (dashboard === null) {
    throw new Error("dashboard not found");
  }
  dashboard.bankBalance += doc.amount;
  await dashboard.save();
};

export const writeDashboardDataOnTransactionUpdateOne = async (
  userId: string
) => {};

export const writeDashboardData = async (stringId: string) => {
  console.time("dashboardBuild");

  const userId = new mongoose.Types.ObjectId(stringId);
  const financialOptions = await User.findById(userId)
    .select({
      _id: false,
      financialOptions: true,
    })
    .then((res) => {
      if (res === null) {
        throw new Error("financialOptions is null");
      }
      return res.financialOptions;
    })
    .catch(() => {
      throw new Error("financialOptions not found");
    });
  const dashboard = await DashboardData.findOne({ user: userId })
    .then((res) => {
      if (res === null) {
        throw new Error("dashboard is null");
      }
      return res;
    })
    .catch(() => {
      throw new Error("dashboard not found");
    });
  const date = new Date();
  const firstOfThisMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const sixMonthsAgo = new Date(
    new Date(
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).setMonth(
        new Date().getMonth() - 5
      )
    ).setDate(1)
  );

  // bankBalance
  dashboard.bankBalance = await Transaction.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, bankBalance: { $sum: "$amount" } } },
  ])
    .then((res) => {
      if (!res.length) {
        return 0;
      }
      const bankBalance: number = res[0].bankBalance;
      if (bankBalance === undefined) {
        throw new Error("bankBalance is undefined");
      }
      return bankBalance;
    })
    .catch(() => {
      throw new Error("financialOptions not found");
    });

  // saved
  // -- ignoriere buchungen aus diesem monat und dann kontostand - notgroschen
  dashboard.saved = await Transaction.aggregate([
    { $match: { user: userId, date: { $gte: firstOfThisMonth } } },
    { $group: { _id: null, thisMonth: { $sum: "$amount" } } },
  ]).then((res) => {
    if (!res.length) {
      return 0;
    }
    const amountSaved =
      dashboard.bankBalance -
      res[0].thisMonth -
      financialOptions.amountEmergencyFund;
    return amountSaved <= 0 ? 0 : amountSaved;
  });

  // scheduledDebit
  // -- alle abbuchungen nach heute und vor monatsende die minus sind
  dashboard.scheduledDebit = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gt: today },
        amount: { $lte: 0 },
      },
    },
    { $group: { _id: null, scheduledDebit: { $sum: "$amount" } } },
  ]).then((res) => {
    if (!res.length) {
      return 0;
    }
    return res[0].scheduledDebit;
  });

  // balanceEndOfMonth
  // -- kontostand heute plus alle buchungen die noch bis ende des monats kommen
  dashboard.balanceEndOfMonth = await Transaction.aggregate([
    { $match: { user: userId, date: { $gte: firstOfThisMonth } } },
    { $group: { _id: null, balanceEndOfMonth: { $sum: "$amount" } } },
  ]).then((res) => {
    if (!res.length) {
      return 0;
    }
    return res[0].balanceEndOfMonth;
  });

  // lastSixMonthsBalance
  // -- alle buchungen vor 6 Monaten bis heute -> group(sum-amount) by month
  const lastSixMonthsBalance = await Transaction.aggregate([
    { $match: { user: userId, date: { $gte: sixMonthsAgo } } },

    {
      $group: {
        _id: { month: { $month: "$date" }, year: { $year: "$date" } },
        balanceOfMonth: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]).then((res) => {
    if (!res.length) {
      return {
        labels: ["Januar", "Februar", "März", "April", "Mai", "Juni"],
        data: [0, 0, 0, 0, 0, 0],
      };
    }
    const monthNames = [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ];
    return res;
  });
  console.log(lastSixMonthsBalance);

  await dashboard.save();
  console.timeEnd("dashboardBuild");
};
