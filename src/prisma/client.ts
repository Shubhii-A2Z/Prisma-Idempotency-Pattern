import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import serverConfig from "../config/server.config";

const adapter=new PrismaMariaDb({
    host: "localhost",
    user: "root",
    password: serverConfig.DATABASE_PASSWORD!,
    database: "booking_dev",
});

export const prismaClient= new PrismaClient({adapter});