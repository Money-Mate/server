import jwt from "jsonwebtoken";

import { Request, Response, NextFunction } from "express";
import User from "../models/User";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // is cookie attached?
    const token = req.cookies.token;
    if (!token) {
      return res.status(404).json({ msg: "no token found" });
    }

    // has cookie right key?
    const secretkey = process.env.SECRETKEY;
    if (secretkey === undefined) throw new Error("secretkey is undefined");
    const verifiedToken = await jwt.verify(token, secretkey);
    if (!verifiedToken || typeof verifiedToken === "string") {
      return res.status(401).json({ msg: "no valid token" });
    }

    // does user exist?
    const verifiedUser = await User.findById(verifiedToken.userId);
    if (!verifiedUser) {
      return res.status(404).json({ msg: "user not found" });
    }

    res.locals.user = verifiedUser;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "server error!" });
  }
};

export default authenticate;
