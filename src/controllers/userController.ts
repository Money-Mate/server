import User from "../models/User";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    // check if user exists
    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      return res.status(409).json({ msg: "email already used!" });
    }
    const usernameTaken = await User.findOne({ username });
    if (usernameTaken) {
      return res.status(409).json({ msg: "username already taken!" });
    }

    const user = new User({ username, email, password });
    const hashedPassword = await user.hashPassword(password);
    user.password = hashedPassword;
    await user.save();

    const payload = { userId: user.id };
    const secretKey = process.env.SECRETKEY;
    if (secretKey === undefined) {
      throw new Error("secretKey is undefined");
    }
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    return res
      .status(201)
      .json({ msg: "user created successfully!", user: user.getUserData() });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(404).json({ msg: "email not found!" });
    }
    const correctPassword = await userExists.comparePassword(
      password,
      userExists.password
    );
    if (!correctPassword) {
      return res.status(400).json({ msg: "password incorrect!" });
    }
    const payload = { userId: userExists.id };
    const secretKey = process.env.SECRETKEY;
    if (secretKey === undefined) {
      throw new Error("secretKey is undefined");
    }
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ msg: "you are logged in!", token });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    res.cookie("token", "");
    res.json({ msg: "logged out" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const checkToken = (req: Request, res: Response) => {
  try {
    res.json(true);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const data = await User.find();
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const data = await User.findById(req.params.id);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const data = await User.findByIdAndDelete(req.params.id);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
