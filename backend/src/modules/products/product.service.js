const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ProductService {
  async getAllProducts({ search, brand, categoryId, minPrice, maxPrice }) {
    let whereClause = {};
    if (search) whereClause.name = { contains: search };
    if (brand) whereClause.brand = brand;
    if (categoryId) whereClause.categoryId = categoryId;
    if (minPrice || maxPrice) {
      whereClause.price = {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      };
    }
    return await prisma.product.findMany({
      where: whereClause,
      include: { category: true, _count: { select: { serials: true } } },
    });
  }

  async createProduct(data) {
    return await prisma.product.create({ data });
  }

  async getSerialDetail(code) {
    return await prisma.serial.findUnique({
      where: { code },
      include: { product: true, warranty: true },
    });
  }
}

module.exports = new ProductService();
