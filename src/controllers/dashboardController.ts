import { Request, Response } from "express";
import DashboardData from "../models/DashboardData";

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const data = await DashboardData.findOne({ user: res.locals.userId });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
