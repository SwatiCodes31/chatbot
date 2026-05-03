const API = "http://localhost:5000/api/orders";

// 🔄 Load Orders
async function loadOrders() {
    try {
        const res = await fetch(API);
        const data = await res.json();

        const list = document.getElementById("order-list");
        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = "<p>No orders yet</p>";
            return;
        }

        data.forEach(order => {
            const li = document.createElement("li");
            li.className = "order-card";

            li.innerHTML = `
                <div>
                    <h3>${order.item}</h3>
                    <p>ID: ${order.id}</p>
                    <p class="${order.status}">
                        Status: ${order.status}
                    </p>
                </div>

                ${
                    order.status === "pending"
                    ? `<button onclick="markReady(${order.id})">Mark Ready</button>`
                    : `<span class="ready">✔ Done</span>`
                }
            `;

            list.appendChild(li);
        });

    } catch (err) {
        console.log("❌ Error loading orders:", err);
    }
}

// ✅ Mark Order Ready
async function markReady(id) {
    try {
        await fetch("http://localhost:5000/api/order-ready", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });

        alert("✅ Order marked ready!");

        loadOrders();

    } catch (err) {
        console.log("❌ Error updating order:", err);
    }
}

// 🔁 Auto refresh every 2 seconds
setInterval(loadOrders, 2000);

// 🚀 Initial load
loadOrders();