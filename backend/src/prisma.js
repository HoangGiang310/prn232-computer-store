const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient({
  adapter: {
    provider: "mysql",
    url: process.env.DATABASE_URL,
  },
});
module.exports = prisma;
