document.addEventListener('DOMContentLoaded', () => {
  const flightTable = document.getElementById('flightTable');
  const noFlightsMessage = document.getElementById('noFlightsMessage');
  const flightForm = document.getElementById('flightForm');

  // Utility to escape HTML (prevent XSS)
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, match => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#039;'
    })[match]);
  }

  // Load and render flights
  function loadFlights() {
    const flights = JSON.parse(localStorage.getItem('flights')) || [];
    flightTable.innerHTML = '';

    if (flights.length === 0) {
      noFlightsMessage.style.display = 'block';
      return;
    }

    noFlightsMessage.style.display = 'none';

    flights.forEach(flight => {
      const row = document.createElement('tr');
      row.dataset.id = flight.id;

      row.innerHTML = `
        <td>${escapeHTML(flight.airline)}</td>
        <td>${escapeHTML(flight.departure)}</td>
        <td>${escapeHTML(flight.arrival)}</td>
        <td>${escapeHTML(flight.date)}</td>
        <td>${escapeHTML(flight.seats)}</td>
        <td>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;
      flightTable.appendChild(row);
    });
  }

  // Delete a flight
  function deleteFlight(id) {
    let flights = JSON.parse(localStorage.getItem('flights')) || [];
    flights = flights.filter(flight => flight.id !== id);
    localStorage.setItem('flights', JSON.stringify(flights));
    loadFlights();
  }

  // Handle edit/delete buttons using event delegation
  flightTable.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    const flightId = row?.dataset?.id;

    if (e.target.classList.contains('edit-btn')) {
      window.location.href = `update.html?id=${flightId}`;
    }

    if (e.target.classList.contains('delete-btn')) {
      deleteFlight(flightId);
    }
  });

  // Validate flight input
  function validateFlight(flight) {
    const errors = [];

    if (!flight.airline.trim()) errors.push('Airline is required.');
    if (!flight.departure.trim()) errors.push('Departure is required.');
    if (!flight.arrival.trim()) errors.push('Arrival is required.');

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(flight.date)) errors.push('Date must be in YYYY-MM-DD format.');

    const seats = parseInt(flight.seats, 10);
    if (isNaN(seats) || seats < 1) errors.push('Seats must be a positive number.');

    return errors;
  }

  // Handle form submit
  if (flightForm) {
    flightForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const flight = {
        id: crypto.randomUUID(),
        airline: flightForm.airline.value.trim(),
        departure: flightForm.departure.value.trim(),
        arrival: flightForm.arrival.value.trim(),
        date: flightForm.date.value,
        seats: flightForm.seats.value
      };

      const errors = validateFlight(flight);

      const errorDiv = document.getElementById('formErrors');
      if (errorDiv) errorDiv.innerHTML = '';

      if (errors.length > 0) {
        if (errorDiv) {
          errorDiv.innerHTML = errors.map(err => `<p style="color:red;">${err}</p>`).join('');
        } else {
          alert(errors.join('\n'));
        }
        return;
      }

      const flights = JSON.parse(localStorage.getItem('flights')) || [];
      flights.push(flight);
      localStorage.setItem('flights', JSON.stringify(flights));

      if (flightForm.reset) flightForm.reset();
      loadFlights();
    });
  }

  loadFlights();
});
