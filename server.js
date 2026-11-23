
const express = require('express');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Test the server
app.get('/api', (req, res) => {
    res.json({ message: 'ClubU API is running!' });
});

// Gets the events
app.get('/api/events', async (req, res) => {
    try {
        const [events] = await db.query('SELECT * FROM events');
        res.json(events);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Get one event
app.get('/api/events/:id', async (req, res) => {
    try {
        const [events] = await db.query('SELECT * FROM events WHERE event_id = ?', [req.params.id]);

        if (events.length === 0) {
            return res.sendStatus(404);
        }

        res.json(events[0]);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Create an event
app.post('/api/events', async (req, res) => {
    try {
        const { description, category, unit, seats, price, info } = req.body;

        if (!description || !category || seats == null || price == null) {
            return res.sendStatus(400);
        }

        const [result] = await db.query(
            'INSERT INTO events (description, category, unit, seats, price, info) VALUES (?, ?, ?, ?, ?, ?)',
            [description, category, unit || 'Seats', seats, price, info || '']
        );

        res.status(201).json({ event_id: result.insertId });
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Update an event
app.put('/api/events/:id', async (req, res) => {
    try {
        const { description, category, unit, seats, price, info } = req.body;

        const [result] = await db.query(
            'UPDATE events SET description = ?, category = ?, unit = ?, seats = ?, price = ?, info = ? WHERE event_id = ?',
            [description, category, unit, seats, price, info, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.sendStatus(404);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Used to delete an event
app.delete('/api/events/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM events WHERE event_id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.sendStatus(404);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// This gets all reservations
app.get('/api/reservations', async (req, res) => {
    try {
        const [reservations] = await db.query('SELECT * FROM reservations');
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Gets reservations by ID
app.get('/api/reservations/ids', async (req, res) => {
    try {
        const ids = (req.query.ids || "").split(",").filter(id => id);

        if (ids.length === 0) {
            return res.json([]);
        }

        const placeholders = ids.map(() => "?").join(",");

        const [reservations] = await db.query(
            `SELECT reservations.*, events.description FROM reservations JOIN events ON reservations.event_id = events.event_id WHERE reservation_id IN (${placeholders})`,
            ids
        );

        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// This creates a reservation
app.post('/api/reservations', async (req, res) => {
    const { event_id, customer_name, customer_email, total, quantity } = req.body;
    if (!event_id || !customer_name || !customer_email || total == null || quantity == null) {
        return res.sendStatus(400);
    }

    const conn = await db.getConnection();
    
    try {
        await conn.beginTransaction();

        const [upd] = await conn.query(
            'UPDATE events SET seats = seats - ? WHERE event_id = ? AND seats >= ?',
            [quantity, event_id, quantity]
        );

        if(!upd.affectedRows) {
            await conn.rollback();
            return res.status(400).json({ error: 'Not enough seats available' });
        }
        const [result] = await conn.query(
            'INSERT INTO reservations (event_id, customer_name, customer_email, total, quantity) VALUES (?, ?, ?, ?, ?)',
            [event_id, customer_name, customer_email, total, quantity]
        );
        await conn.commit();
        res.status(201).json({ reservation_id: result.insertId });
    } catch (error) {
        console.error(error);
        await conn.rollback();
        console.error(error);
        res.sendStatus(500);
    } finally {
        conn.release();
    }
});

// Get all finalizations
app.get('/api/finalizations', async (req, res) => {
    try {
        const [finalizations] = await db.query('SELECT * FROM finalizations');
        res.json(finalizations);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Create a finalization
app.post('/api/finalizations', async (req, res) => {
    try {
        const { reservation_id, attendance_type, payment_method, total } = req.body;

        if (!reservation_id || !attendance_type || !payment_method || total == null) {
            return res.sendStatus(400);
        }

        const [result] = await db.query(
            'INSERT INTO finalizations (reservation_id, attendance_type, payment_method, total) VALUES (?, ?, ?, ?)',
            [reservation_id, attendance_type, payment_method, total]
        );

        res.status(201).json({ finalization_id: result.insertId });
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`ClubU API running at http://localhost:${PORT}`);
});
