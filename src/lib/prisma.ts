import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// LibSQL adapter allows Prisma to work with SQLite files via the LibSQL driver.
const adapter = new PrismaLibSql({ url: "file:dev.db" });

// In development, Next.js hot-reloads modules on every request. Without this
// guard, a new PrismaClient (and thus a new DB connection pool) would be created
// on each reload, eventually exhausting file handles. Storing the client on
// globalThis persists it across hot-reloads.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
