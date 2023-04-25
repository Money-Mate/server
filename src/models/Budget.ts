import mongoose, { Model, Schema, Types } from "mongoose";

export interface IBudget {
  user: Types.ObjectId;
  item: string;
  amount: number;
  amountspent: number;
  amountleft: number;
}

type BudgetModel = Model<IBudget>;

export const BudgetSchema = new Schema<IBudget, BudgetModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  item: {
    type: String,
    required: true,
    minlength: 1,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  amountspent: {
    type: Number,
    required: true,
    min: 0,
  },
  amountleft: {
    type: Number,
    required: true,
    max: 0,
  },
});

BudgetSchema.pre<IBudget>("save", function () {
  this.amountleft = this.amount - this.amountspent;
});

export const Budget = mongoose.model<IBudget, BudgetModel>(
  "Budget",
  BudgetSchema
);
