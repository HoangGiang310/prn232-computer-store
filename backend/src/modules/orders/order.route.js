const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

router.post("/checkout", authMiddleware, orderController.checkout);
router.get("/", authMiddleware, orderController.getAll);

module.exports = router;
