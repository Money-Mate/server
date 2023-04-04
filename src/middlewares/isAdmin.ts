import { Request, Response, NextFunction } from "express";

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (res.locals.user.role !== "admin") {
      return res.status(401).json({ msg: "401 Unauthorized Access" });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "server error!" });
  }
};

export default isAdmin;
