import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({
    connectionString:process.env.DATABASE_URL
});

const prismaClientSugleton = () => {
    return new PrismaClient({adapter});
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSugleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal || prismaClientSugleton();

if(process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export default prisma;