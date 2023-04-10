import Tag from "../models/Tag";
import { Request, Response } from "express";

export const addTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const data = await new Tag({
      user: res.locals.user._id,
      name,
    }).save();
    res.json({ msg: "Tag created", data });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const getMyTags = async (req: Request, res: Response) => {
  try {
    const data = await Tag.find({ user: res.locals.user._id });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const updateMyTag = async (req: Request, res: Response) => {
  try {
    const data = await Tag.updateOne(
      { user: res.locals.user._id, _id: req.body.tagId },
      { ...req.body.data }
    );
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};

export const deleteMyTagById = async (req: Request, res: Response) => {
  try {
    const data = await Tag.deleteOne({
      user: res.locals.user._id,
      _id: req.params.id,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error" });
  }
};
