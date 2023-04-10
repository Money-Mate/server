import mongoose, { Schema, Model, Types } from "mongoose";

interface ITag {
  user: Types.ObjectId;
  name: string;
  color?: string;
}

type TagModel = Model<ITag>;

const tagSchema = new Schema<ITag, TagModel>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  color: { type: String },
});

const Tag = mongoose.model<ITag, TagModel>("Tag", tagSchema);

export default Tag;
