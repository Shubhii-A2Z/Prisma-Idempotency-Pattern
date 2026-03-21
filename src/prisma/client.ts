import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter=new PrismaMariaDb({
    host: "localhost",
    user: "root",
    database: "booking_dev",
});

export const prismaClient= new PrismaClient({adapter});