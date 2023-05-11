import { Request, Response } from "express";
import { IWish, Wish } from "../models/Wish";

export const addWish = async (req: Request, res: Response) => {
  try {
    const newWish: Partial<IWish> = {};

    // required fields
    newWish.user = res.locals.user._id;
    newWish.name = req.body.name;
    newWish.price = req.body.price;

    const data = await new Wish(newWish).save();
    res.json({ msg: "Wish created", data });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getMyWishes = async (req: Request, res: Response) => {
  try {
    const data = await Wish.find({ user: res.locals.user._id }).select({
      user: false,
      __v: false,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const updateMyWish = async (req: Request, res: Response) => {
  try {
    const data = await Wish.updateOne(
      { user: res.locals.user._id, _id: req.body.wishId },
      { ...req.body.data }
    );
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const deleteMyWish = async (req: Request, res: Response) => {
  try {
    const data = await Wish.deleteOne({
      user: res.locals.user._id,
      _id: req.params.id,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
