const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

router.get("/", productController.getAll);
router.get("/:id", productController.getOne);
router.post("/", authMiddleware, productController.create);
router.put("/:id", authMiddleware, productController.update);
router.delete("/:id", authMiddleware, productController.delete);

module.exports = router;
