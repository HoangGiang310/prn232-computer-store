const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class OrderController {
  async createOrderPOS(req, res, next) {
    const { customerId, items, discount, payMethod } = req.body; // items: [{productId, serialCode}]
    const staffId = req.user.id;

    try {
      const result = await prisma.$transaction(async (tx) => {
        let total = 0;
        const orderItemsData = [];

        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product)
            throw new Error(`Không tìm thấy sản phẩm mã ${item.productId}`);

          const serial = await tx.serial.findUnique({
            where: { code: item.serialCode },
          });
          if (!serial || serial.status !== "IN_STOCK") {
            throw new Error(
              `Số Máy Serial ${item.serialCode} không khả dụng trong kho.`,
            );
          }

          total += product.price;

          // Cập nhật trạng thái số serial máy
          await tx.serial.update({
            where: { code: item.serialCode },
            data: { status: "SOLD", soldAt: new Date() },
          });

          orderItemsData.push({
            productId: item.productId,
            price: product.price,
          });
        }

        const finalTotal = total - discount;
        const orderCode = "HD-" + Date.now().toString().slice(-8).toUpperCase();

        const newOrder = await tx.order.create({
          data: {
            code: orderCode,
            customerId,
            staffId,
            total: finalTotal,
            discount,
            payMethod,
            status: "COMPLETED",
          },
        });

        for (let i = 0; i < orderItemsData.length; i++) {
          const createdItem = await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: orderItemsData[i].productId,
              price: orderItemsData[i].price,
            },
          });

          // Liên kết ngược mã Serial sang cấu trúc OrderItem và tạo bảo hành tự động 1 năm
          await tx.serial.update({
            where: { code: items[i].serialCode },
            data: {
              orderItemId: createdItem.id,
              warranty: {
                create: {
                  startDate: new Date(),
                  endDate: new Date(
                    new Date().setFullYear(new Date().getFullYear() + 1),
                  ),
                  notes: "Gói bảo hành điện tử tiêu chuẩn 12 tháng hệ thống.",
                },
              },
            },
          });
        }

        return newOrder;
      });

      // Phát thông báo Real-time (Socket.io) đến Admin/Quản lý ngay lập tức
      req.io.emit("new-order-alert", {
        message: `Đơn hàng mới ${result.code} vừa được xuất tại quầy POS!`,
        total: result.total,
      });

      res
        .status(201)
        .json({
          success: true,
          message: "Thanh toán đơn hàng thành công!",
          data: result,
        });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new OrderController();
