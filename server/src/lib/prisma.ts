import { PrismaClient } from "@prisma/client";

// Create a singleton instance of PrismaClient
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('Successfully connected to database');
    return prisma.$queryRaw`SELECT EXISTS (
      SELECT FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'comments'
    );`;
  })
  .then((result) => {
    console.log('Comments table exists:', result);
  })
  .catch((error) => {
    console.error('Database error:', error);
  });

export default prisma;