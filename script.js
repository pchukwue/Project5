// QuickBook - Simple Booking App

class BookingApp {
    constructor() {
        this.bookings = this.loadBookings();
        this.form = document.getElementById('bookingForm');
        this.messageDiv = document.getElementById('message');
        this.bookingsList = document.getElementById('bookingsList');

        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setMinDate();
        this.displayBookings();
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('bookingDate').min = today;
    }

    loadBookings() {
        const stored = localStorage.getItem('quickbook_bookings');
        return stored ? JSON.parse(stored) : [];
    }

    saveBookings() {
        localStorage.setItem('quickbook_bookings', JSON.stringify(this.bookings));
    }

    handleSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('customerName').value.trim();
        const service = document.getElementById('service').value;
        const date = document.getElementById('bookingDate').value;
        const time = document.getElementById('bookingTime').value;

        // Validate required fields
        if (!name || !service || !date || !time) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        // Check for duplicate booking
        if (this.isDuplicateBooking(date, time)) {
            this.showMessage(`A booking already exists for ${date} at ${time}`, 'error');
            return;
        }

        // Create booking
        const booking = {
            id: Date.now(),
            name,
            service,
            date,
            time
        };

        this.bookings.push(booking);
        this.saveBookings();
        this.displayBookings();

        // Show success message and reset form
        this.showMessage(`Booking created for ${name}!`, 'success', 4000);
        this.form.reset();
    }

    isDuplicateBooking(date, time) {
        return this.bookings.some(booking => booking.date === date && booking.time === time);
    }

    cancelBooking(id) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            this.bookings = this.bookings.filter(booking => booking.id !== id);
            this.saveBookings();
            this.displayBookings();
            this.showMessage('Booking cancelled successfully', 'success', 4000);
        }
    }

    displayBookings() {
        if (this.bookings.length === 0) {
            this.bookingsList.innerHTML = '<p class="empty-message">No bookings yet. Create one to get started!</p>';
            return;
        }

        // Sort bookings by date and time
        const sorted = [...this.bookings].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        this.bookingsList.innerHTML = sorted.map(booking => `
            <div class="booking-card">
                <div class="booking-info">
                    <p class="customer-name">${this.escapeHtml(booking.name)}</p>
                    <p><strong>Service:</strong> ${this.escapeHtml(booking.service)}</p>
                    <p><strong>Date:</strong> ${this.formatDate(booking.date)}</p>
                    <p><strong>Time:</strong> ${booking.time}</p>
                </div>
                <button class="cancel-btn" onclick="app.cancelBooking(${booking.id})">Cancel</button>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${month}/${day}/${year}`;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, char => map[char]);
    }

    showMessage(text, type, duration = 3000) {
        this.messageDiv.textContent = text;
        this.messageDiv.className = `message ${type}`;

        setTimeout(() => {
            this.messageDiv.textContent = '';
            this.messageDiv.className = 'message';
        }, duration);
    }
}

// Initialize app when DOM is ready
const app = new BookingApp();
