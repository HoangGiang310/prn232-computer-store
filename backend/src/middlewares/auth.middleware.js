const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({
          message: "Quyền truy cập bị từ chối. Không tìm thấy mã Token.",
        });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.isActive)
      return res
        .status(403)
        .json({ message: "Tài khoản không hợp lệ hoặc đã bị khóa." });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Mã xác thực hết hạn hoặc không hợp lệ." });
  }
};
