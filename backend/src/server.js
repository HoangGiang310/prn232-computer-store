require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const errorMiddleware = require("./middlewares/error.middleware");
const authRoutes = require("./modules/auth/auth.route");
const productRoutes = require("./modules/products/product.route");
const orderRoutes = require("./modules/orders/order.route");
const customerRoutes = require("./modules/customers/customer.route");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
