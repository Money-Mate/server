import mongoose, {Model, Schema, Types} from "mongoose";

export interface IWish {
    user: Types.ObjectId;
    name: string;
    price: number;
    saved: number;
}   

type WishModel = Model<IWish>;

export const WishSchema = new Schema<IWish, WishModel>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        minlength: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    saved: {
        type: Number,
        required: true,
        min: 0,
        max: this.price
    }
});

export const Wish = mongoose.model<IWish, WishModel>("Wish", WishSchema);

