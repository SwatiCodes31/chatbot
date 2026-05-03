// =======================
// 🔊 SPEAK FUNCTION
// =======================
function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  speechSynthesis.speak(u);
}

// =======================
// 🍽️ MENU
// =======================
let menuItems = {
  coffee: 8.99,
  espresso: 10.99,
  latte: 12.99,
  cappuccino: 11.99,
  mocha: 13.99,
  brownie: 9.49
};

let totalBill = 0;
let userOrders = []; // 🆕 track orders

// =======================
// 💬 DOM READY
// =======================
document.addEventListener("DOMContentLoaded", function () {

  let chatToggle = document.getElementById("chatbot-toggle");
  let chatbox = document.getElementById("chatbox");
  let input = document.getElementById("chat-input");
  let chatBody = document.getElementById("chat-body");

  let billItems = document.getElementById("bill-items");
  let totalDisplay = document.getElementById("total");
  let billBox = document.querySelector(".bill-box");

  // CHAT TOGGLE
  if (chatToggle && chatbox) {
    chatToggle.onclick = () => {
      chatbox.style.display =
        chatbox.style.display === "flex" ? "none" : "flex";
    };
  }

  // =======================
  // 💬 CHATBOT
  // =======================
  if (input) {
    input.addEventListener("keypress", async function (e) {

      if (e.key === "Enter" && input.value.trim() !== "") {

        let msg = input.value.toLowerCase();

        let userDiv = document.createElement("p");
        userDiv.textContent = msg;
        chatBody.appendChild(userDiv);

        let reply = "";
        let found = null;

        for (let item in menuItems) {
          if (msg.includes(item)) {
            found = item;
            break;
          }
        }

        if (found) {

          billBox.style.display = "block";

          totalBill += menuItems[found];

          let li = document.createElement("li");
          li.textContent = `${found} - $${menuItems[found]}`;
          billItems.appendChild(li);

          totalDisplay.textContent = totalBill.toFixed(2);

          // 🆕 SAVE ORDER TO BACKEND
          const res = await fetch("http://localhost:5000/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item: found })
          });

          const data = await res.json();
          userOrders.push(data.id);

          reply = `${found} added. Total ${totalBill}`;
          speak(reply);

        } else if (msg.includes("book")) {
          reply = "Please fill the booking form below";
          speak(reply);
        }

        else {
          reply = "Say coffee, latte or book table";
          speak(reply);
        }

        let botDiv = document.createElement("p");
        botDiv.textContent = reply;
        chatBody.appendChild(botDiv);

        input.value = "";
      }
    });
  }

  // =======================
  // 🪑 FORM BOOKING
  // =======================
  let form = document.querySelector(".book form");

  if (form) {

    form.addEventListener("submit", async function (e) {

      e.preventDefault();

      const name = form.querySelector("input[type='text']").value;
      const email = form.querySelector("input[type='email']").value;
      const number = form.querySelector("input[type='number']").value;
      const message = form.querySelector("textarea").value;

      try {

        const res = await fetch("http://localhost:5000/api/book", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, number, message })
        });

        const data = await res.json();

        if (!res.ok) {
          alert("❌ " + data.error);
        } else {
          alert("✅ Table reserved!");
          form.reset();
        }

      } catch {
        alert("Server error ❌");
      }
    });
  }

});

// =======================
// 🔔 CHECK ORDER STATUS (NEW)
// =======================
async function checkOrderStatus() {
  try {
    const res = await fetch("http://localhost:5000/api/orders");
    const data = await res.json();

    data.forEach(order => {
      if (order.status === "ready" && userOrders.includes(order.id)) {

        alert("🎉 Your order is ready: " + order.item);

        // remove so it doesn't repeat
        userOrders = userOrders.filter(id => id !== order.id);
      }
    });

  } catch (err) {
    console.log("Error checking status", err);
  }
}

// check every 3 sec
setInterval(checkOrderStatus, 3000);

// =======================
// 🎤 VOICE ASSISTANT
// =======================
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
let mode = "wake";
let voiceState = "idle";
let tempData = {};

function initVoice() {

  recognition = new SR();
  recognition.lang = "en-US";
  recognition.continuous = true;

  recognition.start();
  recognition.onend = () => recognition.start();

  recognition.onresult = async (event) => {

    let text = event.results[event.results.length - 1][0].transcript.toLowerCase();

    console.log("Heard:", text);

    // WAKE
    if (mode === "wake") {
      if (text.includes("speak")) {
        speak("Voice assistant activated");
        mode = "assistant";
        voiceState = "main";
        speak("Say order or book");
      }
      return;
    }

    // MAIN
    if (voiceState === "main") {

      if (text.includes("order")) {
        voiceState = "order";
        speak("Tell your order");
      }

      else if (text.includes("book")) {
        voiceState = "book-name";
        speak("Tell your name");
      }
    }

    // ORDER
    else if (voiceState === "order") {

      let billItems = document.getElementById("bill-items");
      let totalDisplay = document.getElementById("total");
      let billBox = document.querySelector(".bill-box");

      let found = false;

      for (let item in menuItems) {
        if (text.includes(item)) {

          found = true;
          billBox.style.display = "block";

          let li = document.createElement("li");
          li.textContent = `${item} - $${menuItems[item]}`;
          billItems.appendChild(li);

          totalBill += menuItems[item];
          totalDisplay.textContent = totalBill.toFixed(2);

          // 🆕 SEND TO BACKEND
          const res = await fetch("http://localhost:5000/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item })
          });

          const data = await res.json();
          userOrders.push(data.id);

          speak(`${item} added`);
        }
      }

      if (!found) speak("Item not found");
      else speak(`Total is ${totalBill}`);
    }

    // BOOKING FLOW
    else if (voiceState === "book-name") {
      tempData.name = text;
      voiceState = "book-email";
      speak("Tell your email");
    }

    else if (voiceState === "book-email") {
      tempData.email = text;
      voiceState = "book-phone";
      speak("Tell your phone number");
    }

    else if (voiceState === "book-phone") {

      tempData.number = text;
      tempData.message = "Voice booking";

      try {
        await fetch("http://localhost:5000/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tempData)
        });

        speak("Table booked successfully");

      } catch {
        speak("Booking failed");
      }

      tempData = {};
      voiceState = "idle";
      mode = "wake";

      speak("Say speak to start again");
    }
  };
}

// START
window.onload = () => {
  speak("Welcome. Say speak to start");
  initVoice();
};

// 👨‍🍳 CHEF LOGIN BUTTON
let chefBtn = document.getElementById("chef-login-btn");

if (chefBtn) {
  chefBtn.onclick = () => {

    // simple demo password
    let pass = prompt("Enter Chef Password:");

    if (pass === "1234") {
      window.open("chef.html", "_blank"); // open chef panel
    } else {
      alert("❌ Wrong password");
    }
  };
}