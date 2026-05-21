const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ProductController {
  // [GET] /api/products (Lấy danh sách + Tìm kiếm + Lọc theo khoảng giá)
  async getAll(req, res, next) {
    try {
      const { search, brand, categoryId, minPrice, maxPrice } = req.query;
      let whereClause = {};

      if (search) {
        whereClause.name = { contains: search };
      }
      if (brand) whereClause.brand = brand;
      if (categoryId) whereClause.categoryId = categoryId;
      if (minPrice || maxPrice) {
        whereClause.price = {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        };
      }

      const products = await prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          _count: { select: { serials: { where: { status: "IN_STOCK" } } } }, // Đếm số máy còn trong kho
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  // [POST] /api/products
  async create(req, res, next) {
    try {
      const {
        name,
        brand,
        cpu,
        ram,
        storage,
        display,
        price,
        costPrice,
        categoryId,
        images,
      } = req.body;

      const slug = name.toLowerCase().replace(/ /g, "-") + "-" + Date.now();

      const newProduct = await prisma.product.create({
        data: {
          name,
          slug,
          brand,
          cpu,
          ram,
          storage,
          display,
          price: parseFloat(price),
          costPrice: parseFloat(costPrice),
          categoryId,
          images: images || [], // Dạng Json mảng ảnh
        },
      });

      return res
        .status(201)
        .json({
          success: true,
          message: "Thêm sản phẩm thành công!",
          data: newProduct,
        });
    } catch (error) {
      next(error);
    }
  }

  // [GET] /api/products/serials/:code (Tra cứu lý lịch máy theo số Serial)
  async getSerialDetail(req, res, next) {
    try {
      const { code } = req.params;
      const serialData = await prisma.serial.findUnique({
        where: { code },
        include: { product: true, warranty: true, import: true },
      });

      if (!serialData) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Không tìm thấy số máy Serial này trên hệ thống.",
          });
      }

      return res.status(200).json({ success: true, data: serialData });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
