// server.js

const express = require("express");
const cors = require("cors");

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ---- Simple "database" (in-memory) ----
let bookings = [];
const MAX_SEATS = 5; // demo capacity

// ---- ROUTES ----

// ✅ Health check
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

  html += `</table>`;

  res.send(html);
});

// ✅ Get all bookings
app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});

// ✅ Create booking
app.post("/api/book", (req, res) => {
  try {
    const { name, email, number, message } = req.body;

    // 🔥 LOG DATA (IMPORTANT)
    console.log("📩 Booking received:", req.body);

    // 🔴 Validation
    if (!name || !email || !number) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    // 🔴 Seat limit check
    if (bookings.length >= MAX_SEATS) {
      return res.status(409).json({
        error: "No seats available"
      });
    }

    // ✅ Create booking
    const booking = {
      id: Date.now(),
      name,
      email,
      number,
      message: message || "",
      time: new Date().toLocaleString()
    };

    // ✅ Save booking
    bookings.push(booking);

    // 🔥 LOG COUNT
    console.log("📊 Total bookings:", bookings.length);

    // ✅ Response
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

// ---- START SERVER ----
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});