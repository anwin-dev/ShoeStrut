const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const adminRouter = require("./router/admin");
const userRouter = require("./router/user");
const shopRouter = require("./router/shop");
const AdminProductRouter = require("./router/AdminProduct");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 7000;
const app = express();

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const mongoUrl =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ShoeStrut";
const mongoDbName = process.env.MONGO_DB_NAME || "ShoeStrut";

mongoose
  .connect(mongoUrl, { dbName: mongoDbName })
  .then(() => {
    const { host, name } = mongoose.connection;
    console.log(`[mongo] connected host=${host} db=${name}`);
  })
  .catch((err) => console.error("MongoDB connection error:", err.message));

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.JWT_SECRET || "stepstyle-local-session",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "StepStyle API is running" });
});

app.get("/health/db", async (req, res) => {
  try {
    const { productPush } = require("./model/productModel");
    const { categoryModel } = require("./model/categoryModel");
    const { User } = require("./model/userModel");

    const [products, categories, users] = await Promise.all([
      productPush.countDocuments({}),
      categoryModel.countDocuments({}),
      User.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      db: mongoose.connection.name,
      host: mongoose.connection.host,
      counts: { products, categories, users },
    });
  } catch (error) {
    console.error("[health/db] error:", error);
    res.status(500).json({ success: false, message: "DB health check failed" });
  }
});

app.use(express.static(path.join(__dirname, "Public")));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/product", shopRouter);
app.use("/api/admin/product", AdminProductRouter);

app.use(function(req, res, next) {
  res.status(404).json({ success: false, message: "API Route Not Found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error"
  });
});



app.listen(PORT, "0.0.0.0", () => {
  console.log(`server is running on port ${PORT}`);
});
