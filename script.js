// JavaScript for student login page
// store users into user.json

// JavaScript for student login page
// store users into user.json

document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault(); // stop form from refreshing page

    const user = {
        name: document.getElementById("name").value,
        age: document.getElementById("age").value,
        email: document.getElementById("email").value,
        address: document.getElementById("address").value,
        phone: document.getElementById("phone").value
    };

    // Get existing users or create empty array
    let users = JSON.parse(localStorage.getItem("userData")) || [];

    // Add new user
    users.push(user);

    // Save back to localStorage
    localStorage.setItem("userData", JSON.stringify(users));

    alert("Signup successful! User stored.");
    document.getElementById("signupForm").reset();
});
 



