require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
prisma.$queryRawUnsafe("SELECT 1 as ok")
  .then((rows) => {
    console.log("POSTGRES_OK", rows);
  })
  .catch((err) => {
    console.error("POSTGRES_FAIL", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
