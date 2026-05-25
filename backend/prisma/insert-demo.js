require("dotenv").config();
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const { URL } = require("url");

function getConnectionConfig() {
  const url = new URL(process.env.DATABASE_URL);

  return {
    host: url.hostname,
    port: Number.parseInt(url.port || "3306", 10),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\/+/, ""),
  };
}

async function queryOne(connection, sql, params = []) {
  const [rows] = await connection.execute(sql, params);
  return rows[0];
}

async function ensureCategory(connection, name) {
  const existing = await queryOne(
    connection,
    "SELECT id FROM `Category` WHERE name = ?",
    [name],
  );

  if (existing) {
    return existing.id;
  }

  const [result] = await connection.execute(
    "INSERT INTO `Category` (name, createdAt, updatedAt) VALUES (?, NOW(), NOW())",
    [name],
  );

  return result.insertId;
}

async function ensureUser(
  connection,
  { name, email, password, role, isActive = true },
) {
  const existing = await queryOne(
    connection,
    "SELECT id FROM `User` WHERE email = ?",
    [email],
  );

  if (existing) {
    await connection.execute(
      "UPDATE `User` SET name = ?, password = ?, role = ?, isActive = ?, updatedAt = NOW() WHERE id = ?",
      [name, password, role, isActive ? 1 : 0, existing.id],
    );

    return existing.id;
  }

  const [result] = await connection.execute(
    "INSERT INTO `User` (name, email, password, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
    [name, email, password, role, isActive ? 1 : 0],
  );

  return result.insertId;
}

async function ensureCustomer(connection, { name, phone, email, address }) {
  const existing = await queryOne(
    connection,
    "SELECT id FROM `Customer` WHERE email = ? AND phone = ?",
    [email, phone],
  );

  if (existing) {
    await connection.execute(
      "UPDATE `Customer` SET name = ?, address = ?, updatedAt = NOW() WHERE id = ?",
      [name, address, existing.id],
    );

    return existing.id;
  }

  const [result] = await connection.execute(
    "INSERT INTO `Customer` (name, phone, email, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
    [name, phone, email, address],
  );

  return result.insertId;
}

async function ensureProduct(connection, product) {
  const existing = await queryOne(
    connection,
    "SELECT id FROM `Product` WHERE slug = ?",
    [product.slug],
  );

  if (existing) {
    await connection.execute(
      "UPDATE `Product` SET name = ?, brand = ?, cpu = ?, ram = ?, storage = ?, display = ?, price = ?, costPrice = ?, stock = ?, images = ?, categoryId = ?, updatedAt = NOW() WHERE id = ?",
      [
        product.name,
        product.brand,
        product.cpu,
        product.ram,
        product.storage,
        product.display,
        product.price,
        product.costPrice,
        product.stock,
        product.images,
        product.categoryId,
        existing.id,
      ],
    );

    return existing.id;
  }

  const [result] = await connection.execute(
    "INSERT INTO `Product` (name, slug, brand, cpu, ram, storage, display, price, costPrice, stock, images, categoryId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
    [
      product.name,
      product.slug,
      product.brand,
      product.cpu,
      product.ram,
      product.storage,
      product.display,
      product.price,
      product.costPrice,
      product.stock,
      product.images,
      product.categoryId,
    ],
  );

  return result.insertId;
}

async function ensureOrder(
  connection,
  { code, customerId, staffId, productId, quantity, price },
) {
  const existing = await queryOne(
    connection,
    "SELECT id FROM `Order` WHERE code = ?",
    [code],
  );

  if (existing) {
    return existing.id;
  }

  const [orderResult] = await connection.execute(
    "INSERT INTO `Order` (code, customerId, staffId, total, discount, payMethod, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
    [code, customerId, staffId, price * quantity, 0, "CASH", "PENDING"],
  );

  await connection.execute(
    "INSERT INTO `OrderItem` (orderId, productId, quantity, price, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
    [orderResult.insertId, productId, quantity, price],
  );

  return orderResult.insertId;
}

async function main() {
  const connection = await mysql.createConnection(getConnectionConfig());

  try {
    const password = await bcrypt.hash("admin123", 10);
    const categoryId = await ensureCategory(connection, "Laptop Gaming");
    const productId = await ensureProduct(connection, {
      name: "ASUS ROG Flow Z13",
      slug: "asus-rog-flow-z13",
      brand: "ASUS",
      cpu: "Intel Core i9",
      ram: "32GB",
      storage: "1TB SSD",
      display: "13.4-inch 165Hz",
      price: 52990000,
      costPrice: 41990000,
      stock: 6,
      images: "https://example.com/images/asus-rog-flow-z13.jpg",
      categoryId,
    });
    const staffId = await ensureUser(connection, {
      name: "Nhân viên bán hàng",
      email: "staff@computerstore.local",
      password,
      role: "STAFF",
      isActive: true,
    });
    const customerId = await ensureCustomer(connection, {
      name: "Nguyễn Văn A",
      phone: "0901234567",
      email: "customer@example.com",
      address: "Hà Nội",
    });

    const orderId = await ensureOrder(connection, {
      code: "ORD-20260525-0001",
      customerId,
      staffId,
      productId,
      quantity: 1,
      price: 52990000,
    });

    console.log("✅ Insert demo hoàn thành.");
    console.log({ categoryId, productId, staffId, customerId, orderId });
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("❌ Lỗi insert demo:", error);
  process.exit(1);
});
