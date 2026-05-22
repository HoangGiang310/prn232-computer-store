const express = require("express");
const router = express.Router();
const customerController = require("./customer.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

router.get("/", authMiddleware, customerController.getAll);
router.get("/:id", authMiddleware, customerController.getOne);
router.post("/", authMiddleware, customerController.create);
router.put("/:id", authMiddleware, customerController.update);
router.delete("/:id", authMiddleware, customerController.delete);

module.exports = router;
