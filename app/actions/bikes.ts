"use server";

import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });

const prisma = new PrismaClient({ adapter });

export interface BikeFilters {
  brandId?: string;
  frameMaterial?: string;
  brakeSystem?: string;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
}

export async function getBikes(filters?: BikeFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.brandId) where.brandId = filters.brandId;
  if (filters?.frameMaterial) where.frameMaterial = filters.frameMaterial;
  if (filters?.brakeSystem) where.brakeSystem = filters.brakeSystem;

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {
      ...(filters?.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters?.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters?.tag) {
    where.scenarioTags = { contains: filters.tag };
  }

  return prisma.bike.findMany({
    where,
    include: { brand: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBikeById(id: string) {
  return prisma.bike.findUnique({
    where: { id },
    include: { brand: true },
  });
}

export async function getBrands() {
  return prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { bikes: true } } },
  });
}
