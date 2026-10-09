// JavaScript for student login page
// store users into user.json

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

    if (name === "" || age === "" || email === "" || address === "") {
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

    if (updateIndex === -1) {
        users.push(user);
    } else {
        users[updateIndex] = user;
        updateIndex = -1;
    }

    localStorage.setItem("users", JSON.stringify(users));

    form.reset();

    displayUsers();
});


function displayUsers() {
    table.innerHTML = "";

    users.forEach(function(user, index) {
        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + user.name + "</td>" +
            "<td>" + user.age + "</td>" +
            "<td>" + user.email + "</td>" +
            "<td>" + user.address + "</td>" +
            "<td>" + user.phone + "</td>" +
            "<td><button onclick='updateUser(" + index + ")'>Update</button></td>";

        table.appendChild(row);
    });
}


function updateUser(index) {
    document.getElementById("name").value = users[index].name;
    document.getElementById("age").value = users[index].age;
    document.getElementById("email").value = users[index].email;
    document.getElementById("address").value = users[index].address;
    document.getElementById("phone").value = users[index].phone;

    updateIndex = index;
}


downloadButton.addEventListener("click", function() {
    const json = JSON.stringify(users, null, 2);

    const file = new Blob([json], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "users.json";

    link.click();
});



