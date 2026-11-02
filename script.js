
// JavaScript for student login page

// Validate user inputs
function validateUserInput(username, password) {
    if (!username || !password) {
        alert("Please enter both username and password.");
        return false;
    }

    return true;
}

// Store users into users.json

const form = document.getElementById("signupForm");
const table = document.getElementById("memberTable");
const downloadButton = document.getElementById("downloadButton");

let users = JSON.parse(localStorage.getItem("users")) || [];
let updateIndex = -1;

displayUsers();

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const phone = document.getElementById("phone").value;

    if (name == "" || age == "" || email == "" || address == "") {
        alert("Please fill out all required fields.");
        return;
    }

    if (age < 1) {
        alert("Please enter a valid age.");
        return;
    }

    const user = {
        name: name,
        age: age,
        email: email,
        address: address,
        phone: phone
    };

    if (updateIndex == -1) {
        users.push(user);
    } else {
        users[updateIndex] = user;
        updateIndex = -1;
    }

    localStorage.setItem("users", JSON.stringify(users));
    form.reset();

    displayUsers();
});

// Display users in the table
function displayUsers() {
    table.innerHTML = "";

    users.forEach(function(user, index) {
        const row = document.createElement("tr");

        const values = [user.name, user.age, user.email, user.address, user.phone];

        values.forEach(function(value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const updateCell = document.createElement("td");
        const updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.addEventListener("click", function() {
            updateUser(index);
        });
        updateCell.appendChild(updateButton);
        row.appendChild(updateCell);

        table.appendChild(row);
    });
}

// Update user
function updateUser(index) {
    document.getElementById("name").value = users[index].name;
    document.getElementById("age").value = users[index].age;
    document.getElementById("email").value = users[index].email;
    document.getElementById("address").value = users[index].address;
    document.getElementById("phone").value = users[index].phone;

    updateIndex = index;
}

// Download JSON
downloadButton.addEventListener("click", function() {
    const json = JSON.stringify(users, null, 2);
    const file = new Blob([json], {type: "application/json"});

    const link = document.createElement("a");

    link.href = URL.createObjectURL(file);
    link.download = "users.json";

    link.click();
});

document.getElementById("signupForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const userData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value
    };

    fetch("https://jsonplaceholder.typicode.com/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Success:", data);
        alert("Registration submitted!");
    })
    .catch(error => {
        console.error("Error:", error);
    });
});
