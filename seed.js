const fs = require('fs');
const db = require('./db');

(async () => {
    const events = JSON.parse(fs.readFileSync('events.json', 'utf8'));

    for (const event of events) {
        await db.query(
            'INSERT INTO events (event_id, description, category, unit, seats, price, info) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [event.id, event.description, event.category, event.unit, event.seats, event.price, event.info]
        );
    }

    await db.end();
})();