const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token. Vui lòng đăng nhập.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản không hợp lệ hoặc đã bị khóa.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};
