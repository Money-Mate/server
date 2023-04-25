import mongoose, { Model, Schema, Types } from "mongoose";

export interface IWish {
  user: Types.ObjectId;
  name: string;
  price: number;
  moneysaved: number;
  moneyleft: number;
}

type WishModel = Model<IWish>;

export const WishSchema = new Schema<IWish, WishModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  moneyleft: {
    type: Number,
    required: true,
  },
  moneysaved: {
    type: Number,
    required: true,
  },
});

WishSchema.pre<IWish>("save", function () {
  this.moneyleft = this.price - this.moneysaved;
});

export const Wish = mongoose.model<IWish, WishModel>("Wish", WishSchema);
