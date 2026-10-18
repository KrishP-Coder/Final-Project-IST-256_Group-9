// JavaScipt for the product page


// Variables for each input field
const eventList = document.getElementById("event-list");
const eventForm = document.getElementById("eventForm");

const eventId = document.getElementById("itemId");
const eventName = document.getElementById("description");
const eventCategory = document.getElementById("category");
const eventFormat = document.getElementById("unit");
const eventCost = document.getElementById("price");
const additionalInfo = document.getElementById("info");
const searchBar = document.getElementById("searchBar");

// Create or update an event
eventForm.addEventListener("submit", function(event) {
    event.preventDefault();

    //get values from the input fields
    let id = eventId.value;
    let name = eventName.value;
    let category = eventCategory.value;
    let format = eventFormat.value;
    let cost = eventCost.value;
    let info = additionalInfo.value;

});