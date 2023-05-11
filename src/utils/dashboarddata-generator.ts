import mongoose from "mongoose";
import DashboardData, { IDashboardData } from "../models/DashboardData";
import Transaction from "../models/Transaction";
import User, { IUser } from "../models/User";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Budget } from "../models/Budget";
import { Wish } from "../models/Wish";

dayjs.extend(utc);

export const writeDashboardData = async (stringId: string) => {
  console.time("dashboardBuild");

  // get userData
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

  // dates setup
  // const now = dayjs.utc().toDate();
  const today = dayjs.utc(dayjs.utc().format("YYYY-MM-DD")).toDate();
  const sixMonthsAgo = dayjs.utc(today).subtract(5, "months").date(1).toDate();
  const firstOfThisMonth = dayjs.utc(today).date(1).toDate();
  const lastOfThisMonth = dayjs.utc(today).endOf("month").toDate();

  // write dashboard
  dashboard.bankBalance = await getBankBalance(userId);
  const savedAmount = await getSaved(
    userId,
    firstOfThisMonth,
    dashboard,
    financialOptions
  );
  dashboard.saved = savedAmount;
  dashboard.scheduledDebit = await getScheduledDebit(userId, today);
  dashboard.balanceEndOfMonth = await getBalanceEndOfMonth(
    userId,
    firstOfThisMonth
  );
  dashboard.incomeForThisMonth = await getIncomeForThisMonth(
    userId,
    firstOfThisMonth,
    lastOfThisMonth
  );
  dashboard.expensesForThisMonth = await getExpensesForThisMonth(
    userId,
    firstOfThisMonth,
    lastOfThisMonth
  );
  dashboard.emergencyFundPercent = await getEmergencyFundPercent(
    userId,
    financialOptions
  );
  dashboard.lastSixMonthsBalance = await getBalancePerMonth(
    userId,
    sixMonthsAgo,
    today
  );
  dashboard.lastSixMonthsIncomeAndExpenses =
    await getLastSixMonthsIncomeAndExpenses(userId, sixMonthsAgo, today);
  dashboard.lastSixMonthsExpensesByCategory =
    await getLastSixMonthsExpensesByCategory(userId, sixMonthsAgo, today);
  dashboard.budgetlist = await getBudgetlist(
    userId,
    firstOfThisMonth,
    lastOfThisMonth
  );
  dashboard.wishlist = await getWishlist(userId, savedAmount);

  await dashboard.save();
  console.timeEnd("dashboardBuild");
};

const getBankBalance = async (userId: mongoose.Types.ObjectId) => {
  // bankBalance -- all Transactions amounts summed up
  return await Transaction.aggregate([
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
};

const getSaved = async (
  userId: mongoose.Types.ObjectId,
  firstOfThisMonth: Date,
  dashboard: IDashboardData,
  financialOptions: IUser["financialOptions"]
) => {
  // Saved -- ignoriere buchungen aus diesem monat und dann kontostand - notgroschen
  return await Transaction.aggregate([
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
};

const getScheduledDebit = async (
  userId: mongoose.Types.ObjectId,
  today: Date
) => {
  // scheduledDebit -- alle abbuchungen nach heute und vor monatsende die minus sind
  return await Transaction.aggregate([
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
};

const getBalanceEndOfMonth = async (
  userId: mongoose.Types.ObjectId,
  firstOfThisMonth: Date
) => {
  // balanceEndOfMonth -- kontostand heute plus alle buchungen die noch bis ende des monats kommen
  return await Transaction.aggregate([
    { $match: { user: userId, date: { $gte: firstOfThisMonth } } },
    { $group: { _id: null, balanceEndOfMonth: { $sum: "$amount" } } },
  ]).then((res) => {
    if (!res.length) {
      return 0;
    }
    return res[0].balanceEndOfMonth;
  });
};

const getBalancePerMonth = async (
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date = dayjs.utc().toDate()
) => {
  // lastSixMonthsBalance -- alle buchungen vor 6 Monaten bis heute -> group(sum-amount) by month
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
  ]).then((res) => {
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
};

const getIncomeForThisMonth = async (
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
) => {
  // incomeForThisMonth -- get all income Transaction in this month
  return await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: endDate },
        amount: { $gt: 0 },
      },
    },
    { $group: { _id: null, incomeThisMonth: { $sum: "$amount" } } },
  ]).then((res) => {
    if (!res.length) {
      return 0;
    }
    return res[0].incomeThisMonth;
  });
};

const getExpensesForThisMonth = async (
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
) => {
  // expensesForThisMonth -- get all expenses Transaction in this month
  return await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: endDate },
        amount: { $lt: 0 },
      },
    },
    { $group: { _id: null, expensesThisMonth: { $sum: "$amount" } } },
  ]).then((res) => {
    if (!res.length) {
      return 0;
    }
    return res[0].expensesThisMonth;
  });
};

const getEmergencyFundPercent = async (
  userId: mongoose.Types.ObjectId,
  financialOptions: IUser["financialOptions"]
) => {
  // emergencyFundPercent -- get percentage of emergencyFund/accounBalance
  return await Transaction.aggregate([
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

      const percentage =
        (bankBalance / financialOptions.amountEmergencyFund) * 100;
      return percentage >= 100 ? 100 : Number(percentage.toFixed(2));
    })
    .catch(() => {
      throw new Error("financialOptions not found");
    });
};

const getLastSixMonthsIncomeAndExpenses = async (
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
) => {
  // lastSixMonthsIncomeAndExpenses -- summed up incomes and expenses grouped per month
  return await Transaction.aggregate([
    { $match: { user: userId } },
    {
      $addFields: {
        sortDate: {
          $cond: [
            { $ifNull: ["$statisticDate", false] },
            "$statisticDate",
            "$date",
          ],
        },
      },
    },
    { $match: { sortDate: { $gte: startDate, $lte: endDate } } },
    {
      $facet: {
        income: [
          { $match: { amount: { $gt: 0 } } },
          {
            $group: {
              _id: {
                year: { $year: "$sortDate" },
                month: { $month: "$sortDate" },
              },
              amount: {
                $sum: "$amount",
              },
            },
          },
          {
            $project: {
              _id: 0,
              amount: 1,
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
              amount: {
                $cond: [{ $not: ["$amount"] }, 0, "$amount"],
              },
            },
          },
        ],
        expenses: [
          { $match: { amount: { $lt: 0 } } },
          {
            $group: {
              _id: {
                year: { $year: "$sortDate" },
                month: { $month: "$sortDate" },
              },
              amount: {
                $sum: "$amount",
              },
            },
          },
          {
            $project: {
              _id: 0,
              amount: 1,
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
              amount: {
                $cond: [{ $not: ["$amount"] }, 0, "$amount"],
              },
            },
          },
        ],
      },
    },
  ]).then((res) => {
    if (!res.length) {
      throw new Error("lastSixMonthsIncomeAndExpenses aggregation failed");
    }
    interface IResult {
      labels: string[];
      data: { income: number[]; expenses: number[] };
    }
    const result: IResult = { labels: [], data: { income: [], expenses: [] } };
    interface IMonth {
      month: number;
      year: number;
      amount: number;
    }
    res[0].income.forEach((month: IMonth) => {
      result.labels.push(
        new Date(new Date().setMonth(month.month - 1)).toLocaleString("de-DE", {
          month: "long",
        })
      );
      result.data.income.push(month.amount);
    });
    result.data.expenses = res[0].expenses.map((month: IMonth) =>
      Math.abs(month.amount)
    );
    return result;
  });
};

const getLastSixMonthsExpensesByCategory = async (
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
) => {
  // lastSixMonthsExpensesByCategory -- get expenses of last six months grouped by categories and subcategories
  return await Transaction.aggregate([
    { $match: { user: userId, amount: { $lt: 0 } } },
    {
      $addFields: {
        sortDate: {
          $cond: [
            { $ifNull: ["$statisticDate", false] },
            "$statisticDate",
            "$date",
          ],
        },
      },
    },
    { $match: { sortDate: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: "$subCategory",
        amount: {
          $sum: "$amount",
        },
      },
    },
    {
      $lookup: {
        from: "subcategories",
        localField: "_id",
        foreignField: "_id",
        as: "sub",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "sub.0.parentCategory",
        foreignField: "_id",
        as: "cat",
      },
    },
    {
      $project: {
        _id: 0,
        category: {
          $ifNull: [{ $arrayElemAt: ["$cat.name", 0] }, "nicht zugewiesen"],
        },
        subCategory: {
          $ifNull: [{ $arrayElemAt: ["$sub.name", 0] }, "nicht zugewiesen"],
        },
        amount: { $abs: "$amount" },
      },
    },
  ]);
};

const getBudgetlist = async (
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
) => {
  // budgetlist -- list of budgets and percentages for this month
  const budgetItems: IDashboardData["budgetlist"] = {};

  const budgets = await Budget.find({ user: userId });

  const budgetsWritten = budgets.map(async (budget) => {
    const amount = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          $or: [
            {
              category: {
                $in: budget.categories,
              },
            },
            { subCategory: { $in: budget.subCategories } },
            { tags: { $in: budget.tags } },
          ],
        },
      },
      {
        $group: {
          _id: 0,
          amount: {
            $sum: { $abs: "$amount" },
          },
        },
      },
    ]).then((res) => {
      if (!res.length) {
        return 0;
      }
      return res[0].amount;
    });
    budgetItems[budget.name] = {
      now: amount,
      of: budget.amount,
      percent: Number(((amount / budget.amount) * 100).toFixed(2)),
    };
  });
  await Promise.all(budgetsWritten);
  return budgetItems;
};

const getWishlist = async (
  userId: mongoose.Types.ObjectId,
  savedAmount: number
) => {
  // wishlist -- list of wishes and percentages/canBuy indicator?
  const wishItems: IDashboardData["wishlist"] = {};

  const wishes = await Wish.find({ user: userId });
  wishes.forEach((wish) => {
    wishItems[wish.name] = {
      now: savedAmount,
      of: wish.price,
      percent:
        Number(((savedAmount / wish.price) * 100).toFixed(2)) >= 100
          ? 100
          : Number(((savedAmount / wish.price) * 100).toFixed(2)),
      canAfford: savedAmount >= wish.price,
    };
  });

  return wishItems;

  // logik um wishlists zu zeigen
  // const wishes = await Wishlist.aggregate([
  //   {
  //     $match: {
  //       user: userId,
  //     },
  //   },
  //   { $limit: 1 },
  //   {
  //     $lookup: {
  //       from: "wishes",
  //       localField: "wishes",
  //       foreignField: "_id",
  //       as: "wishes",
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: "$wishes",
  //     },
  //   },
  //   {
  //     $project: {
  //       name: "$wishes.name",
  //       price: "$wishes.price",
  //     },
  //   },
  // ]);
};
