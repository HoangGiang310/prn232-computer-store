const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@computerstore.local" },
    update: {
      name: "Administrator",
      password,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: "Administrator",
      email: "admin@computerstore.local",
      password,
      role: "ADMIN",
      isActive: true,
    },
  });

  await prisma.customer.upsert({
    where: { email: "khachhang1@example.com" },
    update: {},
    create: {
      name: "Khách hàng 1",
      phone: "0901234567",
      email: "khachhang1@example.com",
      address: "Hà Nội",
    },
  });

  await prisma.product.upsert({
    where: { slug: "asus-rog-strix-g16" },
    update: {},
    create: {
      name: "ASUS ROG Strix G16",
      slug: "asus-rog-strix-g16",
      brand: "ASUS",
      cpu: "Intel Core i9",
      ram: "32GB",
      storage: "1TB SSD",
      display: "16-inch 240Hz",
      price: 42990000,
      costPrice: 33990000,
      stock: 10,
      images: "https://example.com/images/asus-rog.jpg",
    },
  });

  await prisma.product.upsert({
    where: { slug: "dell-xps-15" },
    update: {},
    create: {
      name: "Dell XPS 15",
      slug: "dell-xps-15",
      brand: "Dell",
      cpu: "Intel Core i7",
      ram: "16GB",
      storage: "512GB SSD",
      display: "15.6-inch OLED",
      price: 37990000,
      costPrice: 29990000,
      stock: 8,
      images: "https://example.com/images/dell-xps.jpg",
    },
  });
}

main()
  .then(() => {
    console.log("✅ Seed dữ liệu hoàn thành.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
