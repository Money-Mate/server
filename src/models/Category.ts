import mongoose, { Schema, Model, Types } from "mongoose";

interface ICategory {
  user: Types.ObjectId;
  name: string;
}

type CategoryModel = Model<ICategory>;

const categorySchema = new Schema<ICategory, CategoryModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
});

const Category = mongoose.model<ICategory, CategoryModel>(
  "Category",
  categorySchema
);

export default Category;
