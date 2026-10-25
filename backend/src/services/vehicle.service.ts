import { PrismaClient, Vehicle } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateVehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface SearchQuery {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export class VehicleService {
  async createVehicle(data: CreateVehicleInput): Promise<Vehicle> {
    if (data.price < 0 || data.quantity < 0) {
      throw new Error('Price and quantity must be non-negative');
    }
    return prisma.vehicle.create({ data });
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchVehicles(query: SearchQuery): Promise<Vehicle[]> {
    const where: any = {};

    if (query.make) where.make = { contains: query.make };
    if (query.model) where.model = { contains: query.model };
    if (query.category) where.category = { equals: query.category };
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = Number(query.minPrice);
      if (query.maxPrice) where.price.lte = Number(query.maxPrice);
    }

    return prisma.vehicle.findMany({ where });
  }

  async purchaseVehicle(id: string): Promise<Vehicle> {
    return prisma.\(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id } });
      if (!vehicle) throw new Error('Vehicle not found');
      if (vehicle.quantity <= 0) throw new Error('Vehicle out of stock');

      return tx.vehicle.update({
        where: { id },
        data: { quantity: vehicle.quantity - 1 },
      });
    });
  }

  async restockVehicle(id: string, amount: number): Promise<Vehicle> {
    if (amount <= 0) throw new Error('Restock amount must be greater than zero');

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new Error('Vehicle not found');

    return prisma.vehicle.update({
      where: { id },
      data: { quantity: vehicle.quantity + amount },
    });
  }

  async deleteVehicle(id: string): Promise<Vehicle> {
    return prisma.vehicle.delete({ where: { id } });
  }
}
