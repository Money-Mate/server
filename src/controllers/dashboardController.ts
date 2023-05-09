import { Request, Response } from "express";
import DashboardData from "../models/DashboardData";
import { writeDashboardData } from "../utils/dashboarddata-generator";

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    await writeDashboardData(res.locals.user._id);
    const data = await DashboardData.findOne({
      user: res.locals.user._id,
    }).select({ _id: false, user: false, __v: false });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
