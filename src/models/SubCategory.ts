import mongoose, { Schema, Model, Types } from "mongoose";

export interface ISubCategory {
  user: Types.ObjectId;
  name: string;
  parentCategory: Types.ObjectId;
}

type SubCategoryModel = Model<ISubCategory>;

const subCategorySchema = new Schema<ISubCategory, SubCategoryModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

const SubCategory = mongoose.model<ISubCategory, SubCategoryModel>(
  "SubCategory",
  subCategorySchema
);

export default SubCategory;
