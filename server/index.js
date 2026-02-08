const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Subscribe or Update
app.post('/api/subscribe', (req, res) => {
    const { whatsapp, schedule, geekNews, categories, brands } = req.body;

    if (!whatsapp) {
        return res.status(400).json({ error: 'WhatsApp is required' });
    }

    const categoriesStr = JSON.stringify(categories);
    const brandsStr = JSON.stringify(brands);
    const geekNewsInt = geekNews ? 1 : 0;

    const query = `
        INSERT INTO users (whatsapp, schedule, geek_news, categories, brands)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(whatsapp) DO UPDATE SET
            schedule = excluded.schedule,
            geek_news = excluded.geek_news,
            categories = excluded.categories,
            brands = excluded.brands
    `;

    db.run(query, [whatsapp, schedule, geekNewsInt, categoriesStr, brandsStr], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Success', id: this.lastID });
    });
});

// Unsubscribe (Delete)
app.post('/api/unsubscribe', (req, res) => {
    const { whatsapp } = req.body;

    if (!whatsapp) {
        return res.status(400).json({ error: 'WhatsApp is required' });
    }

    db.run('DELETE FROM users WHERE whatsapp = ?', [whatsapp], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'User deleted successfully', changes: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`PouP! Server running on http://localhost:${PORT}`);
});
