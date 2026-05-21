require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
const errorMiddleware = require("./middlewares/error.middleware");

const authRoutes = require("./modules/auth/auth.route");
const productRoutes = require("./modules/products/product.route");
const orderRoutes = require("./modules/orders/order.route");

const app = express();
const server = http.createServer(app);

// WebSockets cho thông báo thời gian thực
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(helmet());
app.use(cors());
app.use(express.json());

// Gán Socket.io vào request để gọi từ Controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Định tuyến API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Quản lý kết nối Socket
io.on("connection", (socket) => {
  console.log(`⚡ Thiết bị kết nối Socket: ${socket.id}`);
  socket.on("disconnect", () => console.log("🛑 Thiết bị ngắt kết nối"));
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Hệ thống Backend đang chạy trên cổng: ${PORT}`);
});
