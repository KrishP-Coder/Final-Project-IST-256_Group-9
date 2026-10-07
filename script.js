// JavaScript for student login page


//validate user inputs --can be altered
function validateUserInput(username, password) {
  if (!username || !password) {
    alert("Please enter both username and password.");
    return false;
  }
  return true;
}

// store users into user.json

