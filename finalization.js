const { useState } = React;

function Finalization() {

    //Retrieve the last reservation from localStorage
    const [reservation] = useState(() => {
        const saved = JSON.parse(localStorage.getItem("clubuReservation"));
        
        if (saved) {
            return saved;
        }

        const previousReservation = JSON.parse(localStorage.getItem("clubuReservations") || "[]");
        return previousReservation.length > 0 ? previousReservation[previousReservation.length - 1] : null;
    });

    //React state for finalization options
    const [attendanceType, setAttendanceType] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    //React state for submisison feedback
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [submitting, setSubmitting] = useState(false);


    //Calculate total cost
    const total = reservation ? Number(reservation.total) || 0 : 0;

    //Handle form submission for finalization
    async function handleSubmit(event) {
        event.preventDefault();

        //Validate reservation
        if (!reservation) {
            setMessage("No reservation found.");
            setIsError(true);
            return;
        }

        //Validate attendance type
        if (!attendanceType) {
            setMessage("Please select an attendance type.");
            setIsError(true);
            return;
        }

        //Validate payment method
        if (!paymentMethod) {
            setMessage("Please select a payment method.");
            setIsError(true);
            return;
        }

        //Clear previous messages
        setMessage("");
        setIsError(false);
        setSubmitting(true);

        //Create JSON document containing reservation information
        const finalizationData = {
            reservation: reservation,
            customer: {
                name: reservation.name,
                email: reservation.email,
            },

            options: {
                attendanceType: attendanceType,
                paymentMethod: paymentMethod,
            },
            
            total: total,
            finalizationDate: new Date().toISOString()
        };

        //Save finalization data to localStorage
        localStorage.setItem("clubuFinalization", JSON.stringify(finalizationData));
        
        try {
            //AJAX request using fetch
            const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(finalizationData)
            });

            if (!response.ok) {
                throw new Error("API submission failed.");
            }

            const result = await response.json();
            setMessage("Finalization successful.");
            setIsError(false);
        } catch (error) {
            setMessage("Your information was saved locally, but API submission failed.");
            setIsError(true);
        } finally {
            setSubmitting(false);
        }
    }

    //Display message when no reservation is found
    if (!reservation || !Array.isArray(reservation.items) || reservation.items.length === 0) {
        return (
        <div className="alert alert-warning">
            No reservation found. Please reserve an event first.
            <p className="mt-2"><a href="shoppingCart.html">Return to Shopping Cart</a></p>
        </div>);
    }

    //React application interface for finalization form
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
                                <td>
                                    ${(Number(item.price) || 0).toFixed(2)}
                                </td>
                            </tr>))}

                    </tbody>
                </table>
            </div>
            <h3>Total: ${total.toFixed(2)}</h3>

            {/* Finalization Form */}
            <h2>Finalization Options</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">

                    <label htmlFor="attendanceType">
                        Attendance Type:
                    </label>

                    <select
                        id="attendanceType" className="form-select" value={attendanceType}
                        onChange={(event) =>
                            setAttendanceType(event.target.value)
                        } required>
                        <option value="">
                            Choose attendance type
                        </option>

                        <option value="Virtual">Virtual</option>
                        <option value="In Person">In Person</option>

                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="paymentType">
                        Payment Type:
                    </label>

                    <select id="paymentType" className="form-select" value={paymentMethod}
                        onChange={(event) => setPaymentMethod(event.target.value)} required>
                        <option value="">
                            Choose payment type
                        </option>

                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                >
                    {submitting
                        ? "Submitting..."
                        : "Confirm Reservation"}
                </button>
            </form>

            {/* Submission Feedback */}
            {message && (

                <div
                    className={
                        isError
                            ? "alert alert-danger mt-3"
                            : "alert alert-success mt-3"
                    }
                    role="alert">
                    {message}
                </div>
            )}
        </div>

    );
}

//Render React application
const rootElement = document.getElementById("finalizationRoot");

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<Finalization />);
} else {
    console.error("Could not find finalizationRoot element.");
}
