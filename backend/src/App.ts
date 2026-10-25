import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-car-dealership-key';

// --- Authentication Middleware ---
interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token, role: user.role, email: user.email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// ==================== VEHICLE ROUTES ====================

// Search Vehicles (must be before /:id routes)
app.get('/api/vehicles/search', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;

    const vehicles = await prisma.vehicle.findMany({
      where: {
        make: make ? { contains: String(make) } : undefined,
        model: model ? { contains: String(model) } : undefined,
        category: category ? { equals: String(category) } : undefined,
        price: {
          gte: minPrice ? parseFloat(String(minPrice)) : undefined,
          lte: maxPrice ? parseFloat(String(maxPrice)) : undefined,
        },
      },
    });

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search vehicles' });
  }
});

// Get all vehicles
app.get('/api/vehicles', authenticateToken, async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Add a new vehicle (Protected - Admin recommended or any authenticated user depending on kata spec)
app.post('/api/vehicles', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { make, model, category, price, quantity } = req.body;
    const newVehicle = await prisma.vehicle.create({
      data: { make, model, category, price: parseFloat(price), quantity: parseInt(quantity) },
    });
    res.status(201).json(newVehicle);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create vehicle' });
  }
});

// Update a vehicle
app.put('/api/vehicles/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { make, model, category, price, quantity } = req.body;
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: { 
        make, 
        model, 
        category, 
        price: price !== undefined ? parseFloat(price) : undefined, 
        quantity: quantity !== undefined ? parseInt(quantity) : undefined 
      },
    });
    res.json(updatedVehicle);
  } catch (error) {
    res.status(404).json({ error: 'Vehicle not found' });
  }
});

// Delete a vehicle (Admin Only)
app.delete('/api/vehicles/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Vehicle not found' });
  }
});

// ==================== INVENTORY ACTIONS ====================

// Purchase vehicle (decreases quantity by 1)
app.post('/api/vehicles/:id/purchase', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicle.quantity <= 0) {
      return res.status(400).json({ error: 'Vehicle is out of stock.' });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: { quantity: vehicle.quantity - 1 },
    });

    res.json({ message: 'Purchase successful', vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// Restock vehicle (Admin Only - increases quantity)
app.post('/api/vehicles/:id/restock', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const addQuantity = amount ? parseInt(amount) : 1;

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: { quantity: vehicle.quantity + addQuantity },
    });

    res.json({ message: 'Restock successful', vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restock vehicle' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;