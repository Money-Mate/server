import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const cookieRefresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = { userId: res.locals.user.id };
    const secretKey = process.env.SECRETKEY;
    if (secretKey === undefined) {
      throw new Error("secretKey is undefined");
    }
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "server error!" });
  }
};

export default cookieRefresh;
