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

    // make sure event ID begins with 'event-'
    if (!id.startsWith("event-")) {
        id = "event-" + id;
    }

    
    // check if user creating a new event or updating an existing one
    let existingEvent = document.getElementById(id);
    let eventItem = existingEvent;

    if (!eventItem) {
        // create a new event item if ID is not already in use
        eventItem = document.createElement("li");
        eventItem.id = id;
        eventItem.classList.add("event-item");
        eventList.appendChild(eventItem);
    }

    // update the event item with the new values
    eventItem.dataset.name = name;
    eventItem.dataset.category = category;
    eventItem.dataset.format = format;
    eventItem.dataset.cost = cost;
    eventItem.dataset.info = info;

    eventItem.replaceChildren();

    // create a new div to hold the event details
    const eventTitle = document.createElement("h6");
    eventTitle.textContent = name;
    eventItem.appendChild(eventTitle);

    const eventDetails = document.createElement("div");
    eventDetails.classList.add("event-details");
    eventDetails.innerHTML = `
        Category: ${category}<br>
        Format: ${format}<br>
        Cost: $${cost}<br>
    `;
    eventItem.appendChild(eventDetails);

    // append info if user inputted anything
    if (info !== "") {
        const eventInfo = document.createElement("div");
        eventInfo.classList.add("event-info");
        eventInfo.textContent = "Info: " + info;
        eventItem.appendChild(eventInfo);
    }

    // apply search filter to the newly created or updated event
    filterEvents();

    // reset the form after submission
    eventForm.reset();

    // display message to the user
    alert(existingEvent ? "Event updated successfully!" : "Event created successfully!");

});

// Search events
function filterEvents() {
    let input = document.getElementById("searchBar").value.toLowerCase();
    let events = document.getElementsByClassName("event-item");

    for (let i = 0; i<events.length; i++) {
    let eventText = events[i].innerText.toLowerCase();

    if (eventText.includes(input)) {
        events[i].classList.remove("hidden");
    }
    else {
      events[i].classList.add("hidden");
    }
  }    
}


searchBar.addEventListener("input", filterEvents);