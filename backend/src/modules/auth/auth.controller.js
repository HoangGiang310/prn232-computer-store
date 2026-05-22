const prisma = require("../../prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Email và mật khẩu là bắt buộc." });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email hoặc mật khẩu không chính xác.",
        });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Email hoặc mật khẩu không chính xác.",
        });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || "secret_key",
        {
          expiresIn: "1d",
        },
      );

      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công.",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const { id, name, email, role } = req.user;
      return res
        .status(200)
        .json({ success: true, user: { id, name, email, role } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
