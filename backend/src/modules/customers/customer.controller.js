const prisma = require("../../prisma");

class CustomerController {
  async getAll(req, res, next) {
    try {
      const customers = await prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const customer = await prisma.customer.findUnique({ where: { id } });
      if (!customer)
        return res
          .status(404)
          .json({ success: false, message: "Khách hàng không tồn tại." });
      return res.status(200).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { name, phone, email, address } = req.body;
      if (!name || !phone) {
        return res.status(400).json({
          success: false,
          message: "Tên và số điện thoại là bắt buộc.",
        });
      }
      const customer = await prisma.customer.create({
        data: { name, phone, email, address },
      });
      return res.status(201).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, phone, email, address } = req.body;
      const customer = await prisma.customer.update({
        where: { id },
        data: { name, phone, email, address },
      });
      return res.status(200).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      await prisma.customer.delete({ where: { id } });
      return res
        .status(200)
        .json({ success: true, message: "Khách hàng đã được xóa." });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
