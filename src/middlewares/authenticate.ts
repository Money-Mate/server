import jwt from "jsonwebtoken";

import { Request, Response, NextFunction } from "express";


const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const token = req.header("auth-token");
    const token = req.cookies.token;
    if (!token) {
      return res.status(404).json({ msg: "no token found" });
    }
    const secretkey = process.env.SECRETKEY;
    if (secretkey === undefined) {
      throw new Error("secretkey is undefined");
    }
    const verified = await jwt.verify(token, secretkey);
    if (!verified) {
      return res.status(401).json({ msg: "no valid token" });
    }
    res.locals.user= verified;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "server error!" });
  }
};

export default authenticate;
