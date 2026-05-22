const prisma = require("../../prisma");

class OrderController {
  async checkout(req, res, next) {
    try {
      const { customerId, items, discount = 0, payMethod } = req.body;
      const staffId = req.user.id;

      if (!customerId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Đơn hàng phải có khách hàng và sản phẩm.",
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        let total = 0;
        const orderItems = [];

        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) {
            throw new Error(`Sản phẩm ${item.productId} không tồn tại.`);
          }
          if (product.stock < item.quantity) {
            throw new Error(
              `Sản phẩm ${product.name} chỉ còn ${product.stock} chiếc trong kho.`,
            );
          }
          const quantity = item.quantity || 1;
          total += product.price * quantity;
          orderItems.push({
            productId: item.productId,
            quantity,
            price: product.price,
          });
        }

        const order = await tx.order.create({
          data: {
            code: `HD-${Date.now()}`,
            customerId,
            staffId,
            total: total - discount,
            discount,
            payMethod,
            status: "COMPLETED",
            items: {
              create: orderItems,
            },
          },
          include: { items: true },
        });

        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity || 1 } },
          });
        }

        return order;
      });

      return res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const orders = await prisma.order.findMany({
        include: {
          customer: true,
          staff: true,
          items: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
