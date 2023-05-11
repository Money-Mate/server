import { Request, Response } from "express";
import Wishlist, { IWishlist } from "../models/Wishlist";
import { Wish } from "../models/Wish";

export const addWishlist = async (req: Request, res: Response) => {
  try {
    const newWishlist: Partial<IWishlist> = {};

    // required fields
    newWishlist.user = res.locals.user._id;
    newWishlist.name = req.body.name;
    const allExists = req.body.wishes.map(async (wish: string) => {
      const foundWish = await Wish.findOne({
        user: res.locals.user._id,
        _id: wish,
      });
      if (foundWish === null) {
        const err = new Error("Wish does not exist");
        err.name = "custom";
        throw err;
      }
    });
    await Promise.all(allExists);
    newWishlist.wishes = req.body.wishes;
    const data = await new Wishlist(newWishlist).save();
    res.json({ msg: "Wishlist created", data });
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      if (err.name === "custom") {
        return res.status(400).json({ msg: err.message });
      }
    }
    res.json({ msg: "server error" });
  }
};

export const getMyWishlists = async (req: Request, res: Response) => {
  try {
    const data = await Wishlist.find({ user: res.locals.user._id }).select({
      user: false,
      __v: false,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const updateMyWishlist = async (req: Request, res: Response) => {
  try {
    const data = await Wishlist.updateOne(
      { user: res.locals.user._id, _id: req.body.wishlistId },
      { ...req.body.data }
    );
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const deleteMyWishlist = async (req: Request, res: Response) => {
  try {
    const data = await Wishlist.deleteOne({
      user: res.locals.user._id,
      _id: req.params.id,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
