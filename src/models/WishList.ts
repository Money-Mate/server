import mongoose, { Model, Schema, Types } from "mongoose";
import { IWish } from "./Wishes";

export interface IWishlist {
  user: Types.ObjectId;
  wishes: IWish[];
}

type WishlistModel = Model<IWishlist>;

const WishlistSchema = new Schema<IWishlist, WishlistModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  wishes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Wish",
    },
  ],
});

const Wishlist = mongoose.model<IWishlist, WishlistModel>("Wishlist", WishlistSchema);

export default Wishlist;
