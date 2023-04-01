import * as dotenv from "dotenv";

if (process.env.OS === "Windows_NT") {
  const local = process.env.npm_config_local_prefix;
  if (local === undefined) {
    throw new Error("npm_config_local_prefix from process.env is undefined");
  }
  dotenv.config({ path: local + "\\src\\.env" });
}

dotenv.config();
