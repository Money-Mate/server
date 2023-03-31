import mongoose from "mongoose";


mongoose.set("strictQuery", true);

const URI = 
process.env.DB_URI !== ""
    ? process.env.DB_URI
    : `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

if (URI === undefined){
  throw new Error("DB_URI is undefined");
}

mongoose
  .connect(URI)
  .then(() => console.log(`Database Connected ${process.env.DB_NAME}`))
  .catch((err) => console.log(err));
