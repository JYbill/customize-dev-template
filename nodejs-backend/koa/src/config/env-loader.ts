import dotenv from "@dotenvx/dotenvx";

import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../env");

dotenv.config({
  path: [
    path.resolve(envPath, `.${process.env.NODE_ENV ?? "development"}.env`),
    path.resolve(envPath, ".env"),
  ],
  overload: false,
  strict: true,
  logLevel: "error",
});
