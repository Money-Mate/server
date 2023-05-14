import mongoose, { Model, Schema, Types } from "mongoose";

export interface IWishlist {
  user: Types.ObjectId;
  name: string;
  wishes?: Types.ObjectId[];
}

type WishlistModel = Model<IWishlist>;

const WishlistSchema = new Schema<IWishlist, WishlistModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true, minlength: 1, unique: true },
  wishes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Wish",
    },
  ],
});

const Wishlist = mongoose.model<IWishlist, WishlistModel>(
  "Wishlist",
  WishlistSchema
);

export default Wishlist;
