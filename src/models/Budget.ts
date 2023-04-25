import mongoose, {Model, Schema, Types} from "mongoose";

export interface IBudget {
    user: Types.ObjectId;
    product: string;
    amount: number;  
    amountleft: number;  
}

type BudgetModel = Model<IBudget>;

export const BudgetSchema = new Schema<IBudget, BudgetModel>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: String,
        required: true,
        minlength: 1,
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    amountleft: {
        type: Number,
        required: true,
        min: this.amount,
        max: 0
    }
});

export const Budget = mongoose.model<IBudget, BudgetModel>("Budget", BudgetSchema);


