// server.js

const express = require("express");
const cors = require("cors");

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ===============================
// 🗂️ DATABASE (IN-MEMORY)
// ===============================
let bookings = [];
let orders = [];

const MAX_SEATS = 5;

// ===============================
// 🏠 HOME ROUTE (SHOW BOOKINGS)
// ===============================
app.get("/", (req, res) => {

  let html = `
    <h1 style="text-align:center;">☕ Coffee Bookings</h1>
    <table border="1" style="margin:auto; border-collapse:collapse; width:80%; text-align:center;">
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Number</th>
        <th>Message</th>
        <th>Time</th>
      </tr>
  `;

  bookings.forEach(b => {
    html += `
      <tr>
        <td>${b.name}</td>
        <td>${b.email}</td>
        <td>${b.number}</td>
        <td>${b.message}</td>
        <td>${b.time}</td>
      </tr>
    `;
  });

  html += `</table><br/><hr/>`;

  // 🧾 ALSO SHOW ORDERS
  html += `
    <h2 style="text-align:center;">🍽️ Orders</h2>
    <table border="1" style="margin:auto; border-collapse:collapse; width:60%; text-align:center;">
      <tr>
        <th>ID</th>
        <th>Item</th>
        <th>Status</th>
      </tr>
  `;

  orders.forEach(o => {
    html += `
      <tr>
        <td>${o.id}</td>
        <td>${o.item}</td>
        <td>${o.status}</td>
      </tr>
    `;
  });

  html += `</table>`;

  res.send(html);
});

// ===============================
// 📅 BOOKING ROUTES
// ===============================

// GET BOOKINGS
app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});

// CREATE BOOKING
app.post("/api/book", (req, res) => {
  try {
    const { name, email, number, message } = req.body;

    console.log("📩 Booking received:", req.body);

    if (!name || !email || !number) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    if (bookings.length >= MAX_SEATS) {
      return res.status(409).json({
        error: "No seats available"
      });
    }

    const booking = {
      id: Date.now(),
      name,
      email,
      number,
      message: message || "",
      time: new Date().toLocaleString()
    };

    bookings.push(booking);

    console.log("📊 Total bookings:", bookings.length);

    res.status(201).json({
      message: "Reservation confirmed",
      booking
    });

  } catch (err) {
    console.log("❌ Server Error:", err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

// ===============================
// 🍽️ ORDER ROUTES (NEW)
// ===============================

// CREATE ORDER (when user orders)
app.post("/api/order", (req, res) => {
  try {
    const { item } = req.body;

    if (!item) {
      return res.status(400).json({
        error: "Item required"
      });
    }

    const order = {
      id: Date.now(),
      item,
      status: "pending",
      time: new Date().toLocaleTimeString()
    };

    orders.push(order);

    console.log("🧾 Order placed:", order);

    res.status(201).json(order);

  } catch (err) {
    console.log("❌ Order Error:", err);

    res.status(500).json({
      error: "Order failed"
    });
  }
});

// GET ALL ORDERS (for chef panel)
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// MARK ORDER AS READY (chef action)
app.post("/api/order-ready", (req, res) => {
  try {
    const { id } = req.body;

    let order = orders.find(o => o.id == id);

    if (!order) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    order.status = "ready";

    console.log("✅ Order ready:", order);

    res.json({
      message: "Order marked ready",
      order
    });

  } catch (err) {
    console.log("❌ Update Error:", err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

// ===============================
// 🚀 START SERVER
// ===============================
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});