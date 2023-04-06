import "./constants/dotenv";
import express from "express";
import "./databases/init";
import userRoute from "./routes/userRoute";
import transactionRoute from "./routes/transactionRoute";
import accountRoute from "./routes/accountRoute";
import dashboardRoute from "./routes/dashboardRoute";
import cors from "cors";
import cookieParser from "cookie-parser";
import { endpointList } from "./utils/express-list-enpoints";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://127.0.0.1:5173",
    credentials: true,
  })
);

app.use("/user", userRoute);
app.use("/transaction", transactionRoute);
app.use("/account", accountRoute);
app.use("/dashboard", dashboardRoute);

endpointList(app);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
