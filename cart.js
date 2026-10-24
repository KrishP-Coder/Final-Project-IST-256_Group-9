// JavaScript for the ClubU shopping cart - Will Taylor

const eventList = document.getElementById("eventList");
const cartItems = document.getElementById("cartItems");
const form = document.getElementById("checkoutForm");

let events = JSON.parse(localStorage.getItem("events"));
let cart = JSON.parse(localStorage.getItem("clubuSeatCart")) || [];

let reservations = JSON.parse(localStorage.getItem("clubuReservations"));
if (reservations == null) {
    const previous = JSON.parse(localStorage.getItem("clubuReservation"));
    reservations = previous ? [previous] : [];
    localStorage.setItem("clubuReservations", JSON.stringify(reservations));
}

updateReservationCount();
displayCart();

if (events == null) {
    $.getJSON("events.json", function(data) {
        events = data;
        setupEvents();
    }).fail(function() {
        showMessage("Couldn't load events.json.", true);
    });
} else {
    setupEvents();
}

function setupEvents() {
    events.forEach(function(item) {
        if (!Number.isInteger(item.seats) || item.seats < 0) {
            item.seats = 20;
        }
        item.unit = "Seats";
    });
    saveEvents();
    displayEvents();
}

function saveEvents() {
    localStorage.setItem("events", JSON.stringify(events));
}

function displayEvents() {
    eventList.innerHTML = "";
    const search = $("#searchBar").val().toLowerCase();

    const matches = $.grep(events, function(item) {
        return (item.id + " " + item.description + " " + item.category)
            .toLowerCase().includes(search);
    });

    matches.forEach(function(item) {
        const index = events.indexOf(item);
        const row = document.createElement("tr");

        [item.id, item.description, item.category, item.seats,
            "$" + Number(item.price).toFixed(2)].forEach(function(value) {
            row.insertCell().textContent = value;
        });

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = item.seats > 0 ? "Reserve Seat" : "Sold Out";
        button.disabled = item.seats == 0;
        button.addEventListener("click", function() {
            reserveSeat(index);
        });
        row.insertCell().appendChild(button);
        eventList.appendChild(row);
    });
}

$("#searchBar").on("input", function() {
    if (events != null) displayEvents();
});

function reserveSeat(index) {
    const item = events[index];

    if (!item.id || !item.description || !item.category || !item.unit ||
        !Number.isFinite(Number(item.price)) || Number(item.price) < 0) {
        showMessage("Event invalid information.", true);
        return;
    }

    if (item.seats < 1) {
        showMessage("No seats are available for this event.", true);
        return;
    }

    const existing = cart.find(function(entry) {
        return entry.id == item.id;
    });

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: item.id,
            description: item.description,
            category: item.category,
            unit: item.unit,
            price: Number(item.price),
            info: item.info || "",
            quantity: 1
        });
    }

    item.seats--;
    saveEvents();
    saveCart();
    displayEvents();
    displayCart();
    showMessage("Seat added to your cart!");
}

function displayCart() {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach(function(item, index) {
        const row = document.createElement("tr");
        total += item.price * item.quantity;

        [item.description, "$" + Number(item.price).toFixed(2), item.quantity].forEach(function(value) {
            row.insertCell().textContent = value;
        });

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Remove";
        button.addEventListener("click", function() {
            removeEvent(index);
        });
        row.insertCell().appendChild(button);
        cartItems.appendChild(row);
    });

    document.getElementById("totalAmount").textContent = total.toFixed(2);
}

function removeEvent(index) {
    const item = cart[index];
    const event = events.find(function(entry) {
        return entry.id == item.id;
    });

    if (event) {
        event.seats += item.quantity;
    }

    cart.splice(index, 1);
    saveEvents();
    saveCart();
    displayEvents();
    displayCart();
    showMessage("Event removed and seats returned.");
}

function saveCart() {
    localStorage.setItem("clubuSeatCart", JSON.stringify(cart));
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("attendeeName").value.trim();
    const emailInput = document.getElementById("attendeeEmail");
    const email = emailInput.value.trim();

    if (cart.length == 0) {
        showMessage("Reserve at least 1 seat before checkout.", true);
        return;
    }
    if (name == "" || email == "" || !emailInput.checkValidity()) {
        showMessage("Please enter a valid name and email.", true);
        return;
    }

    let total = 0;
    cart.forEach(function(item) {
        total += item.price * item.quantity;
    });

    let totalSeats = 0;
    cart.forEach(function(item) {
        totalSeats += item.quantity;
    });

    const reservation = {
        name: name,
        email: email,
        date: new Date().toISOString(),
        items: cart.slice(),
        totalSeats: totalSeats,
        total: Number(total.toFixed(2))
    };

    reservations.push(reservation);
    localStorage.setItem("clubuReservations", JSON.stringify(reservations));
    localStorage.setItem("clubuReservation", JSON.stringify(reservation));

    cart = [];
    saveCart();
    displayCart();
    form.reset();
    updateReservationCount();
    showMessage("Reservation confirmed! Saved in browser; no api.");

    // AJAX 
    $.ajax({
        url: "/api/reservations", // api stuff will be added later
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(reservation),
        success: function() {
            showMessage("Reservation confirmed!");
        },
        error: function() {
            // Saved locally since API aint done
            showMessage("Reservation confirmed! Saved in browser; no api.");
        }
    });
});

// Download reservations json
function updateReservationCount() {
    document.getElementById("reservationCount").textContent =
        "Saved reservations: " + reservations.length;
    document.getElementById("downloadReservationsButton").disabled = reservations.length == 0;
}

document.getElementById("downloadReservationsButton").addEventListener("click", function() {
    const file = new Blob([JSON.stringify(reservations, null, 2)], {type: "application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "reservations.json";
    link.click();
    showMessage("reservations downloaded!");
});

function showMessage(text, isError = false) {
    const message = document.getElementById("message");
    message.textContent = text;
    message.className = isError ? "alert alert-danger mt-3" : "alert alert-success mt-3";
}
