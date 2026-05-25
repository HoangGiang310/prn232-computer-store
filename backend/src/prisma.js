const { PrismaClient } = require("./generated/prisma");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not defined. Please set it in your backend .env file.",
  );
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
