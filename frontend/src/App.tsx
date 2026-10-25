import React, { useState, useEffect } from 'react';
import './App.css';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

function App() {
  const [token, setToken] = useState<string>(localStorage.getItem('token') || '');
  const [role, setRole] = useState<string>(localStorage.getItem('role') || 'USER');
  const [isLoginView, setIsLoginView] = useState<boolean>(true);

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Vehicle data state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('Sedan');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // Fetch vehicles with Bearer token
  const fetchVehicles = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setVehicles(data);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
      setVehicles([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVehicles();
    }
  }, [token]);

  // Handle Login / Register
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLoginView) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        setToken(data.token);
        setRole(data.role);
      } else {
        // Switch to login after successful registration
        setIsLoginView(true);
        alert('Registration successful! Please log in.');
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken('');
    setRole('USER');
    setVehicles([]);
  };

  // Handle adding a new vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          make,
          model,
          category,
          price: Number(price),
          quantity: Number(quantity),
        }),
      });

      if (res.ok) {
        setMake('');
        setModel('');
        setPrice('');
        setQuantity('');
        fetchVehicles();
      }
    } catch (err) {
      console.error('Failed to create vehicle', err);
    }
  };

  // Handle purchase (decreases quantity)
  const handlePurchase = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${id}/purchase`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchVehicles();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error('Failed to purchase vehicle', err);
    }
  };

  // Handle delete (Admin only)
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchVehicles();
      } else {
        const data = await res.json();
        alert(data.error || 'Delete failed (Admin only)');
      }
    } catch (err) {
      console.error('Failed to delete vehicle', err);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.6rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    background: '#fff',
    color: '#333',
  };

  // If not logged in, show Auth Screen
  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#121212', fontFamily: 'Segoe UI, sans-serif' }}>
        <form onSubmit={handleAuthSubmit} style={{ background: '#1e1e1e', padding: '2.5rem', borderRadius: '8px', width: '350px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', color: '#fff' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#007bff' }}>
            {isLoginView ? 'Dealer Login' : 'Register Account'}
          </h2>

          {authError && <div style={{ background: '#dc3545', color: '#fff', padding: '0.5', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{authError}</div>}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} 
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} 
            />
          </div>

          <button type="submit" style={{ width: '100%', background: '#007bff', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
            {isLoginView ? 'Login' : 'Register'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#aaa', margin: 0 }}>
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => setIsLoginView(!isLoginView)} 
              style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isLoginView ? 'Register' : 'Login'}
            </span>
          </p>
        </form>
      </div>
    );
  }

  // Logged-in Dashboard
  return (
    <div style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif', maxWidth: '1000px', margin: '0 auto', color: '#333' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #007bff', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#007bff' }}>Car Dealership Dashboard</h1>
          <p style={{ margin: '0.3rem 0 0', color: '#666' }}>Role: <strong>{role}</strong></p>
        </div>
        <button onClick={handleLogout} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </header>

      {/* Add Vehicle Form */}
      <form onSubmit={handleAddVehicle} style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Add New Vehicle</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
          <input type="text" placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} required style={inputStyle} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Electric">Electric</option>
          </select>
          <input type="number" placeholder="Price (₹ INR)" value={price} onChange={(e) => setPrice(e.target.value)} required style={inputStyle} />
          <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required style={inputStyle} />
        </div>
        <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Add Vehicle
        </button>
      </form>

      {/* Inventory Table */}
      <h3 style={{ marginBottom: '1rem', color: '#333' }}>Current Inventory Stock</h3>
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#007bff', color: 'white' }}>
              <th style={{ padding: '0.85rem' }}>Make</th>
              <th style={{ padding: '0.85rem' }}>Model</th>
              <th style={{ padding: '0.85rem' }}>Category</th>
              <th style={{ padding: '0.85rem' }}>Price (INR)</th>
              <th style={{ padding: '0.85rem' }}>Quantity</th>
              <th style={{ padding: '0.85rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  No vehicles found in inventory.
                </td>
              </tr>
            ) : (
              vehicles.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.85rem', fontWeight: '500' }}>{v.make}</td>
                  <td style={{ padding: '0.85rem' }}>{v.model}</td>
                  <td style={{ padding: '0.85rem' }}>{v.category}</td>
                  <td style={{ padding: '0.85rem', color: '#28a745', fontWeight: 'bold' }}>
                    ₹{v.price.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '12px', 
                      background: v.quantity <= 2 ? '#ffc107' : '#e2e3e5',
                      color: v.quantity <= 2 ? '#000' : '#333',
                      fontSize: '0.85rem'
                    }}>
                      {v.quantity} units
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handlePurchase(v.id)} 
                      disabled={v.quantity <= 0}
                      style={{ background: v.quantity <= 0 ? '#6c757d' : '#28a745', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: v.quantity <= 0 ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
                    >
                      Purchase
                    </button>
                    {role === 'ADMIN' && (
                      <button 
                        onClick={() => handleDelete(v.id)} 
                        style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;