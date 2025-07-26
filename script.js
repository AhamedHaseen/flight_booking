// Flight Booking System JavaScript with AJAX

// Global variables
let currentFlights = [];
let selectedFlight = null;

// Mock flight data (simulating API response)
const mockFlightData = [
  {
    id: 1,
    airline: "SkyWings",
    flightNumber: "SW101",
    from: "NYC",
    to: "LAX",
    departureTime: "08:30",
    arrivalTime: "11:45",
    duration: "5h 15m",
    price: 299,
    class: "economy",
    features: ["WiFi", "Meals", "Entertainment"],
  },
  {
    id: 2,
    airline: "AirConnect",
    flightNumber: "AC205",
    from: "NYC",
    to: "LAX",
    departureTime: "14:20",
    arrivalTime: "17:35",
    duration: "5h 15m",
    price: 349,
    class: "economy",
    features: ["WiFi", "Meals", "Extra Legroom"],
  },
  {
    id: 3,
    airline: "CloudJet",
    flightNumber: "CJ789",
    from: "NYC",
    to: "LAX",
    departureTime: "19:45",
    arrivalTime: "23:00",
    duration: "5h 15m",
    price: 275,
    class: "economy",
    features: ["WiFi", "Snacks"],
  },
];

// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

// Initialize the application
function initializeApp() {
  setupEventListeners();
  setMinDate();
  handleTripTypeChange();
}

// Setup all event listeners
function setupEventListeners() {
  // Form submission
  document
    .getElementById("flightSearchForm")
    .addEventListener("submit", handleFlightSearch);

  // Trip type change
  document.querySelectorAll('input[name="tripType"]').forEach((radio) => {
    radio.addEventListener("change", handleTripTypeChange);
  });

  // City selection validation
  document
    .getElementById("fromCity")
    .addEventListener("change", validateCitySelection);
  document
    .getElementById("toCity")
    .addEventListener("change", validateCitySelection);

  // Booking confirmation
  document
    .getElementById("confirmBooking")
    .addEventListener("click", handleBookingConfirmation);

  // Date validation
  document
    .getElementById("departureDate")
    .addEventListener("change", validateDates);
  document
    .getElementById("returnDate")
    .addEventListener("change", validateDates);
}

// Set minimum date to today
function setMinDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("departureDate").min = today;
  document.getElementById("returnDate").min = today;
}

// Handle trip type change
function handleTripTypeChange() {
  const tripType = document.querySelector(
    'input[name="tripType"]:checked'
  ).value;
  const returnDateContainer = document.getElementById("returnDateContainer");
  const returnDateInput = document.getElementById("returnDate");

  if (tripType === "oneway") {
    returnDateContainer.style.display = "none";
    returnDateInput.required = false;
    returnDateInput.value = "";
  } else {
    returnDateContainer.style.display = "block";
    returnDateInput.required = true;
  }
}

// Validate city selection (prevent same from/to cities)
function validateCitySelection() {
  const fromCity = document.getElementById("fromCity").value;
  const toCity = document.getElementById("toCity").value;

  if (fromCity && toCity && fromCity === toCity) {
    showAlert(
      "Please select different departure and destination cities.",
      "warning"
    );
    document.getElementById("toCity").value = "";
  }
}

// Validate dates
function validateDates() {
  const departureDate = document.getElementById("departureDate").value;
  const returnDate = document.getElementById("returnDate").value;
  const tripType = document.querySelector(
    'input[name="tripType"]:checked'
  ).value;

  if (departureDate) {
    document.getElementById("returnDate").min = departureDate;
  }

  if (tripType === "round" && departureDate && returnDate) {
    if (new Date(returnDate) < new Date(departureDate)) {
      showAlert(
        "Return date cannot be earlier than departure date.",
        "warning"
      );
      document.getElementById("returnDate").value = "";
    }
  }
}

// Handle flight search form submission
function handleFlightSearch(event) {
  event.preventDefault();

  // Get form data
  const formData = getFormData();

  // Validate form
  if (!validateForm(formData)) {
    return;
  }

  // Show loading spinner
  showLoadingSpinner();

  // Simulate AJAX call with setTimeout
  setTimeout(() => {
    searchFlights(formData);
  }, 2000);
}

// Get form data
function getFormData() {
  return {
    tripType: document.querySelector('input[name="tripType"]:checked').value,
    fromCity: document.getElementById("fromCity").value,
    toCity: document.getElementById("toCity").value,
    departureDate: document.getElementById("departureDate").value,
    returnDate: document.getElementById("returnDate").value,
    passengers: document.getElementById("passengers").value,
    flightClass: document.getElementById("flightClass").value,
  };
}

// Validate form data
function validateForm(formData) {
  if (!formData.fromCity || !formData.toCity) {
    showAlert("Please select both departure and destination cities.", "danger");
    return false;
  }

  if (!formData.departureDate) {
    showAlert("Please select a departure date.", "danger");
    return false;
  }

  if (formData.tripType === "round" && !formData.returnDate) {
    showAlert("Please select a return date for round trip.", "danger");
    return false;
  }

  return true;
}

// Show loading spinner
function showLoadingSpinner() {
  document.getElementById("loadingSpinner").classList.remove("d-none");
  document.getElementById("results").classList.add("d-none");
}

// Hide loading spinner
function hideLoadingSpinner() {
  document.getElementById("loadingSpinner").classList.add("d-none");
}

// Simulate AJAX flight search
function searchFlights(searchData) {
  // Simulate API call
  const xhr = new XMLHttpRequest();

  // Simulate async behavior
  setTimeout(() => {
    // Filter flights based on search criteria
    const filteredFlights = mockFlightData.filter((flight) => {
      return (
        flight.from === searchData.fromCity &&
        flight.to === searchData.toCity &&
        flight.class === searchData.flightClass
      );
    });

    // Adjust prices based on class
    const processedFlights = filteredFlights.map((flight) => {
      let adjustedPrice = flight.price;
      if (searchData.flightClass === "business") {
        adjustedPrice *= 2.5;
      } else if (searchData.flightClass === "first") {
        adjustedPrice *= 4;
      }

      return {
        ...flight,
        price: Math.round(adjustedPrice),
        searchData: searchData,
      };
    });

    currentFlights = processedFlights;
    hideLoadingSpinner();
    displayFlightResults(processedFlights, searchData);
  }, 1000);
}

// Display flight search results
function displayFlightResults(flights, searchData) {
  const resultsContainer = document.getElementById("flightResults");
  const resultsSection = document.getElementById("results");

  if (flights.length === 0) {
    resultsContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-plane-slash fa-3x text-muted mb-3"></i>
                <h4>No flights found</h4>
                <p class="text-muted">Please try different search criteria.</p>
            </div>
        `;
  } else {
    resultsContainer.innerHTML = flights
      .map((flight) => createFlightCard(flight, searchData))
      .join("");
  }

  resultsSection.classList.remove("d-none");
  resultsSection.scrollIntoView({ behavior: "smooth" });

  // Add animation
  resultsSection.classList.add("fade-in");
}

// Create flight card HTML
function createFlightCard(flight, searchData) {
  const cityNames = {
    NYC: "New York",
    LAX: "Los Angeles",
    CHI: "Chicago",
    MIA: "Miami",
    LAS: "Las Vegas",
    LON: "London",
    PAR: "Paris",
    TOK: "Tokyo",
    SYD: "Sydney",
    DUB: "Dubai",
  };

  return `
        <div class="flight-card slide-up">
            <div class="flight-header">
                <div class="airline-info">
                    <div class="airline-logo">
                        ${flight.airline.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div class="airline-name">${flight.airline}</div>
                        <div class="flight-number">${flight.flightNumber}</div>
                    </div>
                </div>
                <div class="price-section">
                    <div class="price">$${flight.price}</div>
                    <div class="price-per">per person</div>
                </div>
            </div>
            
            <div class="flight-details">
                <div class="departure-info">
                    <div class="time">${flight.departureTime}</div>
                    <div class="airport">${cityNames[flight.from]} (${
    flight.from
  })</div>
                </div>
                
                <div class="flight-route">
                    <div class="route-line"></div>
                    <div class="duration">${flight.duration}</div>
                </div>
                
                <div class="arrival-info">
                    <div class="time">${flight.arrivalTime}</div>
                    <div class="airport">${cityNames[flight.to]} (${
    flight.to
  })</div>
                </div>
            </div>
            
            <div class="flight-features">
                ${flight.features
                  .map(
                    (feature) => `
                    <div class="feature">
                        <i class="fas fa-check"></i>
                        <span>${feature}</span>
                    </div>
                `
                  )
                  .join("")}
            </div>
            
            <button class="btn book-btn" onclick="openBookingModal(${
              flight.id
            })">
                <i class="fas fa-ticket-alt"></i> Book This Flight
            </button>
        </div>
    `;
}

// Open booking modal
function openBookingModal(flightId) {
  selectedFlight = currentFlights.find((flight) => flight.id === flightId);

  if (!selectedFlight) {
    showAlert("Flight not found. Please try again.", "danger");
    return;
  }

  // Populate booking summary
  updateBookingSummary(selectedFlight);

  // Show modal
  const bookingModal = new bootstrap.Modal(
    document.getElementById("bookingModal")
  );
  bookingModal.show();
}

// Update booking summary in modal
function updateBookingSummary(flight) {
  const cityNames = {
    NYC: "New York",
    LAX: "Los Angeles",
    CHI: "Chicago",
    MIA: "Miami",
    LAS: "Las Vegas",
    LON: "London",
    PAR: "Paris",
    TOK: "Tokyo",
    SYD: "Sydney",
    DUB: "Dubai",
  };

  const totalPrice = flight.price * parseInt(flight.searchData.passengers);

  document.getElementById("bookingSummary").innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <strong>Flight:</strong> ${flight.airline} ${
    flight.flightNumber
  }<br>
                <strong>Route:</strong> ${cityNames[flight.from]} → ${
    cityNames[flight.to]
  }<br>
                <strong>Date:</strong> ${formatDate(
                  flight.searchData.departureDate
                )}<br>
                <strong>Time:</strong> ${flight.departureTime} - ${
    flight.arrivalTime
  }
            </div>
            <div class="col-md-6">
                <strong>Passengers:</strong> ${flight.searchData.passengers}<br>
                <strong>Class:</strong> ${capitalizeFirst(
                  flight.searchData.flightClass
                )}<br>
                <strong>Price per person:</strong> $${flight.price}<br>
                <strong>Total Price:</strong> <span class="text-success fs-5">$${totalPrice}</span>
            </div>
        </div>
    `;
}

// Handle booking confirmation
function handleBookingConfirmation() {
  // Get passenger form data
  const passengerData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    passport: document.getElementById("passport").value,
  };

  // Validate passenger form
  if (!validatePassengerForm(passengerData)) {
    return;
  }

  // Simulate booking process
  processBooking(passengerData);
}

// Validate passenger form
function validatePassengerForm(data) {
  for (let key in data) {
    if (!data[key]) {
      showAlert("Please fill in all required fields.", "danger");
      return false;
    }
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showAlert("Please enter a valid email address.", "danger");
    return false;
  }

  return true;
}

// Process booking (simulate AJAX request)
function processBooking(passengerData) {
  // Show loading state on button
  const confirmBtn = document.getElementById("confirmBooking");
  const originalText = confirmBtn.innerHTML;
  confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  confirmBtn.disabled = true;

  // Simulate API call
  setTimeout(() => {
    // Generate booking reference
    const bookingRef = generateBookingReference();

    // Hide booking modal
    const bookingModal = bootstrap.Modal.getInstance(
      document.getElementById("bookingModal")
    );
    bookingModal.hide();

    // Show success modal
    showSuccessModal(bookingRef);

    // Reset form and button
    document.getElementById("passengerForm").reset();
    confirmBtn.innerHTML = originalText;
    confirmBtn.disabled = false;

    // Store booking in localStorage (simulate database)
    storeBooking(bookingRef, passengerData, selectedFlight);
  }, 3000);
}

// Generate booking reference
function generateBookingReference() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "SB" + result;
}

// Show success modal
function showSuccessModal(bookingRef) {
  document.getElementById("bookingReference").textContent = bookingRef;
  const successModal = new bootstrap.Modal(
    document.getElementById("successModal")
  );
  successModal.show();
}

// Store booking in localStorage
function storeBooking(bookingRef, passengerData, flightData) {
  const bookings = JSON.parse(localStorage.getItem("flightBookings") || "[]");
  const booking = {
    reference: bookingRef,
    passenger: passengerData,
    flight: flightData,
    bookingDate: new Date().toISOString(),
  };
  bookings.push(booking);
  localStorage.setItem("flightBookings", JSON.stringify(bookings));
}

// Utility function to show alerts
function showAlert(message, type = "info") {
  // Create alert element
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText =
    "top: 20px; right: 20px; z-index: 10000; min-width: 300px;";
  alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  // Add to body
  document.body.appendChild(alert);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.parentNode.removeChild(alert);
    }
  }, 5000);
}

// Utility function to format date
function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

// Utility function to capitalize first letter
function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Add some additional interactive features
document.addEventListener("DOMContentLoaded", function () {
  // Add hover effects to form elements
  const formElements = document.querySelectorAll(".form-control, .form-select");
  formElements.forEach((element) => {
    element.addEventListener("focus", function () {
      this.parentElement.classList.add("focused");
    });

    element.addEventListener("blur", function () {
      this.parentElement.classList.remove("focused");
    });
  });
});

// Handle responsive navigation
window.addEventListener("resize", function () {
  // Close mobile menu when window is resized to desktop
  if (window.innerWidth > 992) {
    const navCollapse = document.querySelector(".navbar-collapse");
    if (navCollapse.classList.contains("show")) {
      navCollapse.classList.remove("show");
    }
  }
});

// Add loading states for better UX
function addLoadingState(element, text = "Loading...") {
  element.disabled = true;
  element.dataset.originalText = element.innerHTML;
  element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
}

function removeLoadingState(element) {
  element.disabled = false;
  element.innerHTML = element.dataset.originalText || element.innerHTML;
}

// Initialize tooltips if Bootstrap tooltips are needed
function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Call initialize tooltips when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeTooltips);

console.log("Flight Booking System JavaScript loaded successfully!");
