"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// SINGLETON: Reuse the same PrismaClient across the entire application.
// Creating multiple instances opens redundant connection pools, which
// exhausts the database's connection limit and adds massive latency.
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
exports.default = exports.prisma;
