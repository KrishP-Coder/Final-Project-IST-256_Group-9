const { useState, useEffect } = React;

function Finalization() {

    // React state for reservations
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);

    // React state for finalization options
    const [attendanceType, setAttendanceType] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    // React state for submission feedback
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Load the reservations from the database
    useEffect(() => {
        const ids = JSON.parse(localStorage.getItem("clubuReservationIds") || "[]");

        if (ids.length === 0) {
            setLoading(false);
            return;
        }

        fetch("http://localhost:3000/api/reservations/ids?ids=" + ids.join(","))
            .then(res => {
                if (!res.ok) {
                    throw new Error("Could not load reservations.");
                }
                return res.json();
            })
            .then(rows => {
                if (rows.length) {
                    setReservation({
                        name: rows[0].customer_name,
                        email: rows[0].customer_email,
                        total: rows.reduce((sum, r) => sum + Number(r.total), 0),
                        items: rows.map(r => ({
                            id: r.reservation_id,
                            description: r.description,
                            quantity: r.quantity,
                            price: Number(r.total) / r.quantity
                        }))
                    });
                }
            })
            .catch(error => {
                console.error(error);
                setMessage("Could not load reservations.");
                setIsError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    // Calculates total cost
    const total = reservation ? Number(reservation.total) || 0 : 0;

    // Handles form submission
    async function handleSubmit(event) {
        event.preventDefault();

        if (!attendanceType || !paymentMethod) {
            setMessage("Please select an attendance type and payment method.");
            setIsError(true);
            return;
        }

        setMessage("");
        setIsError(false);
        setSubmitting(true);

        // Saves reservation information locally
        const finalizationData = {
            reservation: reservation,
            options: { attendanceType: attendanceType, paymentMethod: paymentMethod },
            total: total,
            finalizationDate: new Date().toISOString()
        };

        localStorage.setItem("clubuFinalization", JSON.stringify(finalizationData));

        try {
            // Saves finalization information to the database
            for (const item of reservation.items) {
                const response = await fetch("http://localhost:3000/api/finalizations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        reservation_id: item.id,
                        attendance_type: attendanceType,
                        payment_method: paymentMethod,
                        total: Number((item.price * item.quantity).toFixed(2))
                    })
                });

                if (!response.ok) {
                    throw new Error("Finalization submission failed.");
                }
            }

            setMessage("Finalization successful.");
            setIsError(false);
        } catch (error) {
            console.error(error);
            setMessage("Submission failed. Please try again.");
            setIsError(true);
        } finally {
            setSubmitting(false);
        }
    }

    // Displays a message while reservations load
    if (loading) {
        return <p>Loading reservations...</p>;
    }

    // Displays a message if no reservation exists
    if (!reservation || !Array.isArray(reservation.items) || reservation.items.length === 0) {
        return (
            <div className="alert alert-warning">
                No reservation found. Please reserve an event first.
                <p className="mt-2"><a href="shoppingCart.html">Return to Shopping Cart</a></p>
            </div>
        );
    }

    // Displays the reservation and finalization form
    return (
        <div>
            <h2>Your Reservations</h2>
            <p><strong>Name:</strong> {reservation.name}</p>
            <p><strong>Email:</strong> {reservation.email}</p>

            {/* Reservation Table */}
            <div className="table-responsive">
                <table className="table table-dark table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>Event Name</th>
                            <th>Seats</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservation.items.map((item, index) => (
                            <tr key={item.id || index}>
                                <td>{item.description}</td>
                                <td>{item.quantity}</td>
                                <td>${(Number(item.price) || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h3>Total: ${total.toFixed(2)}</h3>

            {/* Finalization Form */}
            <h2>Finalization Options</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="attendanceType">Attendance Type:</label>
                    <select id="attendanceType" className="form-select" value={attendanceType} onChange={(event) => setAttendanceType(event.target.value)} required>
                        <option value="">Choose attendance type</option>
                        <option value="Virtual">Virtual</option>
                        <option value="In Person">In Person</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="paymentType">Payment Type:</label>
                    <select id="paymentType" className="form-select" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} required>
                        <option value="">Choose payment type</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Submitting..." : "Confirm Reservation"}
                </button>
            </form>

            {/* Submission Feedback */}
            {message && (
                <div className={isError ? "alert alert-danger mt-3" : "alert alert-success mt-3"} role="alert">
                    {message}
                </div>
            )}
        </div>
    );
}

// Renders the React application
const rootElement = document.getElementById("finalizationRoot");

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<Finalization />);
} else {
    console.error("Could not find finalizationRoot element.");
}
