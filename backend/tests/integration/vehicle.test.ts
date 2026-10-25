import request from 'supertest';
import app from '../../src/App';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Vehicles API (TDD Integration)', () => {
  let userToken: string;
  let adminToken: string;
  let testVehicleId: string;

  beforeAll(async () => {
    // Clean database before tests
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // Register normal user
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@test.com', password: 'password123', role: 'USER' });

    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' });
    userToken = userRes.body.token;

    // Register admin user
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'admin@test.com', password: 'password123', role: 'ADMIN' });

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should allow creating a vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Toyota',
        model: 'Camry',
        category: 'Sedan',
        price: 25000,
        quantity: 5,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    testVehicleId = res.body.id;
  });

  it('should fetch all vehicles with valid token', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should allow purchasing a vehicle and decreasing quantity', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${testVehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(4);
  });

  it('should restrict vehicle deletion to admins only', async () => {
    const userDelRes = await request(app)
      .delete(`/api/vehicles/${testVehicleId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(userDelRes.status).toBe(403);

    const adminDelRes = await request(app)
      .delete(`/api/vehicles/${testVehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminDelRes.status).toBe(204);
  });
});