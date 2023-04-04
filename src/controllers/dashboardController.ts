import { Request, Response } from "express";
import DashboardData from "../models/DashboardData";

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const data = await DashboardData.findOne({
      user: res.locals.user._id,
    }).select({ _id: false, user: false });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
