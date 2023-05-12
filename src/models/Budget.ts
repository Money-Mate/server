import mongoose, { Model, Schema, Types } from "mongoose";

export interface IBudget {
  user: Types.ObjectId;
  name: string;
  amount: number;
  interval: "week" | "month" | "year";
  categories?: Types.ObjectId[];
  subCategories?: Types.ObjectId[];
  tags?: Types.ObjectId[];
}

type BudgetModel = Model<IBudget>;

export const BudgetSchema = new Schema<IBudget, BudgetModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  interval: {
    type: String,
    enum: ["week", "month", "year"],
    default: "month",
    required: true,
  },
  categories: { type: [{ type: Schema.Types.ObjectId, ref: "Category" }] },
  subCategories: {
    type: [{ type: Schema.Types.ObjectId, ref: "SubCategory" }],
  },
  tags: { type: [{ type: Schema.Types.ObjectId, ref: "Tag" }] },
});

export const Budget = mongoose.model<IBudget, BudgetModel>(
  "Budget",
  BudgetSchema
);
