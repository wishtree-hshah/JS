const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// ---------- Dummy data ----------
const customers = [
  { id: "123", name: "Alice Johnson" },
  { id: "456", name: "Bob Smith" },
  { id: "789", name: "Charlie Brown" },
  { id: "101", name: "David Lee" },
  { id: "102", name: "Eve White" },
  { id: "103", name: "Frank Green" },
  { id: "104", name: "Grace Black" },
  { id: "105", name: "Hank Blue" },
  { id: "106", name: "Ivy Purple" },
  
];

const stock = [
  { stockId: "P001", productName: "Running Shoes" },
  { stockId: "P002", productName: "Wireless Headphones" },
  { stockId: "P003", productName: "Smart Watch" },
  { stockId: "P004", productName: "Laptop Backpack" },
  { stockId: "P005", productName: "Smartphone Stand" },
  { stockId: "P006", productName: "Bluetooth Speaker" },
  { stockId: "P007", productName: "Fitness Tracker" },
  { stockId: "P008", productName: "Travel Pillow" },
  { stockId: "P009", productName: "Water Bottle" },
  { stockId: "P010", productName: "Smart TV" },
  { stockId: "P011", productName: "Wireless Keyboard" },
  { stockId: "P012", productName: "Smart Home Hub" },
  { stockId: "P013", productName: "Smart Air Fryer" },
  { stockId: "P014", productName: "Smart Air Conditioner" },
  { stockId: "P015", productName: "Smart Air Purifier" },
  
];

const orders = {
  "123": [
    { orderId: "ORD101", stockId: "P001", productName: "Running Shoes", quantity: 1, orderDate: "2025-08-01T10:00:00Z" },
    { orderId: "ORD102", stockId: "P002", productName: "Wireless Headphones", quantity: 1, orderDate: "2025-08-10T15:30:00Z" },
    { orderId: "ORD103", stockId: "P003", productName: "Smart Watch", quantity: 1, orderDate: "2025-08-15T12:00:00Z" },
    { orderId: "ORD104", stockId: "P004", productName: "Laptop Backpack", quantity: 1, orderDate: "2025-08-15T12:00:00Z" },
  ],
  "456": [
    { orderId: "ORD201", stockId: "P003", productName: "Smart Watch", quantity: 1, orderDate: "2025-08-05T12:00:00Z" },
    { orderId: "ORD202", stockId: "P004", productName: "Laptop Backpack", quantity: 1, orderDate: "2025-08-05T12:00:00Z" },
  ],
  "789": [
    { orderId: "ORD301", stockId: "P005", productName: "Smartphone Stand", quantity: 1, orderDate: "2025-08-05T12:00:00Z" },
    { orderId: "ORD302", stockId: "P006", productName: "Bluetooth Speaker", quantity: 1, orderDate: "2025-08-05T12:00:00Z" },
  ],
  "101": [
    { orderId: "ORD401", stockId: "P007", productName: "Fitness Tracker", quantity: 1, orderDate: "2025-08-05T12:00:00Z" },
    { orderId: "ORD402", stockId: "P008", productName: "Travel Pillow", quantity: 1, orderDate: "2025-08-05T12:00:00Z" },
  ],
  "102": [
    { orderId: "ORD501", stockId: "P009", productName: "Water Bottle", quantity: 1, orderDate: "2025-08-05T12:00:00Z" },       
    { orderId: "ORD502", stockId: "P010", productName: "Smart TV", quantity: 1, orderDate: "2025-08-05T12:00:00Z" },
    { orderId: "ORD503", stockId: "P011", productName: "Wireless Keyboard", quantity: 1, orderDate: "2025-08-05T12:00:00Z" },
    { orderId: "ORD504", stockId: "P012", productName: "Smart Home Hub", quantity: 1, orderDate: "2025-08-05T12:00:00Z" },
    { orderId: "ORD505", stockId: "P013", productName: "Smart Air Fryer", quantity: 1, orderDate: "2025-08-05T12:00:00Z" },
    { orderId: "ORD506", stockId: "P014", productName: "Smart Air Conditioner", quantity: 1, orderDate: "2025-08-05T12:00:00Z" }, 
  ]
};

// ---------- Helpers ----------
const findCustomerByName = (name) =>
  customers.find((c) => c.name.toLowerCase() === String(name || "").toLowerCase());

const findProductById = (id) => stock.find((p) => p.stockId.toLowerCase() === String(id || "").toLowerCase());

const findProductByName = (name) =>
  stock.find((p) => p.productName.toLowerCase() === String(name || "").toLowerCase());

// ---------- 1) Login by name ----------
app.post("/auth/login-by-name", (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "Name is required" });

  const customer = findCustomerByName(name);
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  console.log("customer login: ", customer.name);
  return res.json({
    customerId: customer.id,
    name: customer.name,
    message: `Welcome back ${customer.name}!`,
    sessionToken: `token-${customer.id}-${Date.now()}`
  });
});

// ---------- 2) Fetch previous orders ----------
app.get("/customers/:customerId/orders", (req, res) => {
  const { customerId } = req.params;
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ error: "Unauthorized. Missing Bearer token." });
  }
  console.log("authHeader: ", authHeader);
  const customerOrders = orders[customerId] || [];
  console.log("customer orders: ", customerOrders);
  return res.json({
    orders: customerOrders,
    lastOrder: customerOrders.length ? customerOrders[customerOrders.length - 1] : null,
  });
});

// ---------- 3) Place order (by stockId OR productName) ----------
app.post("/orders", (req, res) => {
  const { customerId, stockId, productName, quantity } = req.body || {};
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ error: "Unauthorized. Missing Bearer token." });
  }
  console.log("authHeader: ", authHeader);

  if (!customerId) return res.status(400).json({ error: "customerId is required" });
  if (!quantity || Number(quantity) <= 0) return res.status(400).json({ error: "quantity must be a positive number" });

  let product = null;
  if (stockId) product = findProductById(stockId);
  if (!product && productName) product = findProductByName(productName);
  if (!product) return res.status(404).json({ error: "Product not found in stock by given id/name" });

  const newOrder = {
    orderId: `ORD${Math.floor(Math.random() * 100000)}`,
    stockId: product.stockId,
    productName: product.productName,
    quantity: Number(quantity),
    orderDate: new Date().toISOString(),
  };

  if (!orders[customerId]) orders[customerId] = [];
  orders[customerId].push(newOrder);
  console.log("new order: ", newOrder);

  return res.status(201).json({
    confirmationId: `CONFIRM-${Math.floor(Math.random() * 100000)}`,
    status: "confirmed",
    order: newOrder,
  });
});

// ---------- 4) (Optional) List stock for discovery ----------
app.get("/stock", (req, res) => res.json({ stock }));

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`🚀 Open E-commerce API running on http://localhost:${PORT}`);
});
