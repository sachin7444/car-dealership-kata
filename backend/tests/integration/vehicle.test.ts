import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

describe('Vehicles API (TDD Integration)', () => {
  let userToken: string;
  let adminToken: string;
  let testVehicleId: string;

  beforeAll(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    userToken = jwt.sign({ id: 'user-1', role: 'USER' }, JWT_SECRET);
    adminToken = jwt.sign({ id: 'admin-1', role: 'ADMIN' }, JWT_SECRET);
  });

  afterAll(async () => {
    await prisma.\();
  });

  it('RED/GREEN: POST /api/vehicles - should allow creating a vehicle when authenticated', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', Bearer \)
      .send({
        make: 'Tesla',
        model: 'Model 3',
        category: 'EV',
        price: 39990,
        quantity: 5,
      });

    expect(res.status).toBe(201);
    expect(res.body.make).toBe('Tesla');
    testVehicleId = res.body.id;
  });

  it('RED/GREEN: POST /api/vehicles/:id/purchase - should decrease quantity by 1', async () => {
    const res = await request(app)
      .post(/api/vehicles/\/purchase)
      .set('Authorization', Bearer \);

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(4);
  });
});
