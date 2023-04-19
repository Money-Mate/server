import mongoose, { mongo } from "mongoose";
import DashboardData from "../models/DashboardData";
import Transaction, { ITransaction } from "../models/Transaction";
import User from "../models/User";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

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

  // const now = dayjs.utc().toDate();
  const today = dayjs.utc(dayjs.utc().format("YYYY-MM-DD")).toDate();
  const sixMonthsAgo = dayjs.utc(today).subtract(5, "months").date(1).toDate();
  const firstOfThisMonth = dayjs.utc(today).date(1).toDate();

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
  dashboard.lastSixMonthsBalance = await getBalancePerMonth(
    userId,
    sixMonthsAgo,
    today
  ).then((res) => {
    if (!res.length) {
      throw new Error("lastSixMonths aggregation failed");
    }
    interface IResult {
      labels: string[];
      data: number[];
    }
    const result: IResult = { labels: [], data: [] };
    interface IMonth {
      month: number;
      year: number;
      balanceOfMonth: number;
    }
    res.forEach((month: IMonth) => {
      result.labels.push(
        new Date(new Date().setMonth(month.month - 1)).toLocaleString("de-DE", {
          month: "long",
        })
      );
      result.data.push(month.balanceOfMonth);
    });
    return result;
  });

  await dashboard.save();
  console.timeEnd("dashboardBuild");
};

const getBalancePerMonth = async (
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date = dayjs.utc().toDate()
) => {
  return await Transaction.aggregate([
    { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        balanceOfMonth: {
          $sum: "$amount",
        },
      },
    },
    {
      $project: {
        _id: 0,
        balanceOfMonth: 1,
        date: {
          $dateFromString: {
            dateString: {
              $concat: [
                "01-",
                { $toString: "$_id.month" },
                "-",
                { $toString: "$_id.year" },
              ],
            },
            format: "%d-%m-%Y",
          },
        },
      },
    },
    {
      $densify: {
        field: "date",
        range: {
          step: 1,
          unit: "month",
          bounds: [startDate, endDate],
        },
      },
    },
    {
      $project: {
        month: { $month: "$date" },
        year: { $year: "$date" },
        balanceOfMonth: {
          $cond: [{ $not: ["$balanceOfMonth"] }, 0, "$balanceOfMonth"],
        },
      },
    },
  ]);
};

// incomeThisMonth
const getIncomeForThisMonths = async (
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date = dayjs.utc().toDate()
) => {
  // funktion ausdenken damit der jetztige Monat automatisch herausgefunden wird
  await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: endDate, amount: { $gt: 0 } },
      },
    },
    { $group: { _id: null, IncomeThisMonth: { $sum: "$amount" } } },
  ]).then((res) => {
    if (!res.length) {
      return 0;
    }
    return res[0].IncomeThisMonth;
  });
};

// expensesThisMonth
const expensesForThisMonths = async (
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date = dayjs.utc().toDate()
) => {
  // funktion ausdenken damit der jetztige Monat automatisch herausgefunden wird
  await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: endDate, amount: { $lt: 0 } },
      },
    },
    { $group: { _id: null, ExpensesThisMonth: { $sum: "$amount" } } },
  ]).then((res) => {
    if (!res.length) {
      return 0;
    }
    return res[0].ExpensesThisMonth;
  });
};


// budgets
// muss noch überarbeitet werden wenn die models stehen
const showBudget = async (
  userId: mongoose.Types.ObjectId,
  category: mongoose.Types.ObjectId
) => {
  await Transaction.aggregate([
    { $match: { user: userId, category: category } },
    { $group: { _id: null, budget: { $sum: "$amount" } } },
  ]).then((res) => {
    if (!res.length) {
      return 0;
    }
    return res[0].showBudget;
  });
};


// wishlists
// muss noch überarbeitet werden wenn die models stehen
const showWishlist = async (
  userId: mongoose.Types.ObjectId,
  category: mongoose.Types.ObjectId
) => {
  await Transaction.aggregate([
    { $match: { user: userId, category: category } },
    { $group: { _id: null, wishlist: { $sum: "$amount" } } },
  ]).then((res) => {
    if (!res.length) {
      return 0;
    }
    return res[0].showWishlist;
  });
};
