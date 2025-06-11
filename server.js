import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

const products = [
  { id: 1, name: 'Laptop', price: 1200, cantidad: 15 },
  { id: 2, name: 'Phone', price: 800, cantidad: 21 },
  { id: 3, name: 'Monitor', price: 500, cantidad: 12 },
  { id: 4, name: 'Headphones', price: 150, cantidad: 4 },
  { id: 5, name: 'PC Gamer', price: 2500, cantidad: 1 },
];

app.get('/products', (req, res) => {
  res.json(products);
});

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP API running on http://localhost:${PORT}`);
});
