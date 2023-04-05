import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import DashboardData from "./DashboardData";

interface IUser {
  username: string;
  email: string;
  password: string;
  role: string;
}

interface IUserMethods {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, userPassword: string): Promise<boolean>;
  getUserData(): IUser;
}

type UserModel = Model<IUser, {}, IUserMethods>;

export const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  username: { type: String, required: true, minlength: 3, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

userSchema.methods.hashPassword = async function (password: string) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.comparePassword = async function (
  password: string,
  userPassword: string
) {
  return await bcrypt.compare(password, userPassword);
};

userSchema.methods.getUserData = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

userSchema.post("save", async function (doc) {
  await new DashboardData({ user: doc._id }).save();
});

const User = mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
