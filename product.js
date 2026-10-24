// JavaScript for the product page

const form = document.getElementById("eventForm");
const table = document.getElementById("eventTable");
const downloadButton = document.getElementById("downloadButton");

let events = JSON.parse(localStorage.getItem("events"));

if (events === null) {
    fetch("events.json")
        .then(response => {
            if (!response.ok) throw new Error("Could not load events.json");
            return response.json();
        })
        .then(data => {
            events = data;
            localStorage.setItem("events", JSON.stringify(events));
            setupEvents();
        })
        .catch(() => {
            events = [];
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
    localStorage.setItem("events", JSON.stringify(events));
    displayEvents();
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    if (events === null) {
        showMessage("Events have not loaded yet.", true);
        return;
    }

    let id = document.getElementById("itemId").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value;
    const seatsInput = document.getElementById("seats").value;
    const seats = Number(seatsInput);
    const cost = document.getElementById("price").value;
    const info = document.getElementById("info").value.trim();

    if (id === "" || description === "" || category === "" || seatsInput === "" || cost === "") {
        showMessage("Please fill out all required fields.", true);
        return;
    }

    if (!Number.isInteger(seats) || seats < 0) {
        showMessage("Please enter a valid number of available seats.", true);
        return;
    }

    if (!Number.isFinite(Number(cost)) || Number(cost) < 0) {
        showMessage("Please enter a valid event cost.", true);
        return;
    }

    if (!id.startsWith("event-")) {
        id = "event-" + id;
    }

    const newEvent = {
        id: id,
        description: description,
        category: category,
        unit: "Seats",
        seats: seats,
        price: Number(cost),
        info: info
    };

    const index = events.findIndex(item => item.id === id);

    if (index === -1) {
        events.push(newEvent);
    } else {
        events[index] = newEvent;
    }

    localStorage.setItem("events", JSON.stringify(events));

    clearForm();
    displayEvents();

    if (index === -1) {
        showMessage("Event added successfully!");
    } else {
        showMessage("Event updated successfully!");
    }
});

function displayEvents() {
    table.innerHTML = "";

    events.forEach(function(item, index) {
        const row = document.createElement("tr");

        const values = [
            item.id,
            item.description,
            item.category,
            item.seats,
            "$" + Number(item.price).toFixed(2),
            item.info
        ];

        values.forEach(function(value) {
            const cell = row.insertCell();
            cell.textContent = value;
        });

        row.insertCell().innerHTML =
            "<button type='button' onclick='updateEvent(" + index + ")'>Update</button>";

        table.appendChild(row);
    });

    filterEvents();
}

function updateEvent(index) {
    const item = events[index];

    document.getElementById("itemId").value = item.id;
    document.getElementById("description").value = item.description;
    document.getElementById("category").value = item.category;
    document.getElementById("seats").value = item.seats;
    document.getElementById("price").value = item.price;
    document.getElementById("info").value = item.info;

    document.getElementById("itemId").readOnly = true;
    document.getElementById("saveButton").textContent = "Update Event";

    form.scrollIntoView({behavior: "smooth"});
}

function clearForm() {
    form.reset();

    document.getElementById("itemId").readOnly = false;
    document.getElementById("saveButton").textContent = "Add Event";
}

document.getElementById("cancelButton").addEventListener("click", clearForm);

function showMessage(text, isError = false) {
    const message = document.getElementById("message");

    message.textContent = text;

    if (isError) {
        message.className = "alert alert-danger mt-3";
    } else {
        message.className = "alert alert-success mt-3";
    }
}

function filterEvents() {
    const search = $("#searchBar").val().toLowerCase();

    $("#eventTable tr").each(function() {
        $(this).toggle($(this).text().toLowerCase().includes(search));
    });
}

$("#searchBar").on("input", filterEvents);

downloadButton.addEventListener("click", function() {
    const json = JSON.stringify(events, null, 2);
    const file = new Blob([json], {type: "application/json"});

    const link = document.createElement("a");

    link.href = URL.createObjectURL(file);
    link.download = "events.json";

    link.click();
    URL.revokeObjectURL(link.href);
});
