const prisma = require("../../prisma");

class ProductController {
  async getAll(req, res, next) {
    try {
      const { search, brand, minPrice, maxPrice, stockStatus } = req.query;
      const where = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
          { cpu: { contains: search, mode: "insensitive" } },
          { ram: { contains: search, mode: "insensitive" } },
        ];
      }
      if (brand) {
        where.brand = { equals: brand, mode: "insensitive" };
      }
      if (minPrice || maxPrice) {
        where.price = {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        };
      }
      if (stockStatus) {
        if (stockStatus === "in_stock") {
          where.stock = { gt: 0 };
        } else if (stockStatus === "low_stock") {
          where.stock = { gt: 0, lt: 5 };
        } else if (stockStatus === "out_of_stock") {
          where.stock = 0;
        }
      }

      const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Sản phẩm không tồn tại." });
      }
      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

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
        stock,
        images,
      } = req.body;

      if (!name || !brand || price === undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Tên, hãng và giá là bắt buộc." });
      }

      const slug = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
      const imageString = Array.isArray(images)
        ? images.filter(Boolean).join(",")
        : images || "";
      const product = await prisma.product.create({
        data: {
          name,
          slug,
          brand,
          cpu,
          ram,
          storage,
          display,
          price: parseFloat(price),
          costPrice: costPrice ? parseFloat(costPrice) : 0,
          stock: stock ? parseInt(stock, 10) : 0,
          images: imageString,
        },
      });
      return res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const {
        name,
        brand,
        cpu,
        ram,
        storage,
        display,
        price,
        costPrice,
        stock,
        images,
      } = req.body;

      const imageString = Array.isArray(images)
        ? images.filter(Boolean).join(",")
        : images || "";
      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          brand,
          cpu,
          ram,
          storage,
          display,
          price:
            price !== undefined && price !== "" ? parseFloat(price) : undefined,
          costPrice:
            costPrice !== undefined && costPrice !== ""
              ? parseFloat(costPrice)
              : undefined,
          stock:
            stock !== undefined && stock !== ""
              ? parseInt(stock, 10)
              : undefined,
          images: images !== undefined ? imageString : undefined,
        },
      });
      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      await prisma.product.delete({ where: { id } });
      return res
        .status(200)
        .json({ success: true, message: "Xóa sản phẩm thành công." });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
