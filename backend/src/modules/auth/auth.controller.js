const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthController {
  // [POST] /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1. Kiểm tra tài khoản tồn tại
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res
          .status(401)
          .json({
            success: false,
            message: "Email hoặc mật khẩu không chính xác.",
          });
      }

      // 2. Kiểm tra trạng thái tài khoản
      if (!user.isActive) {
        return res
          .status(403)
          .json({ success: false, message: "Tài khoản của bạn đã bị khóa." });
      }

      // 3. Kiểm tra mật khẩu (Giả định mật khẩu trong DB đã được hash bằng bcrypt)
      // Trong thực tế: const isMatch = await bcrypt.compare(password, user.password);
      const isMatch = password === user.password; // Test nhanh bằng text thô, khuyên dùng bcrypt khi chạy thật

      if (!isMatch) {
        return res
          .status(401)
          .json({
            success: false,
            message: "Email hoặc mật khẩu không chính xác.",
          });
      }

      // 4. Tạo mã JWT Access Token (Thời hạn 1 ngày)
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      // 5. Trả về cho Frontend lưu trữ
      return res.status(200).json({
        success: true,
        message: "Đăng nhập hệ thống thành công!",
        token,
        user: { id: user.id, name: user.name, role: user.role },
      });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /api/auth/me
  async getMe(req, res, next) {
    try {
      // req.user được điền vào từ auth.middleware sau khi giải mã token thành công
      return res.status(200).json({ success: true, user: req.user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
