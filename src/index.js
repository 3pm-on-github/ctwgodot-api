const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const STAGES_DIR = path.join(__dirname, '..', 'db', 'stages');

app.use(express.json({ limit: '10mb' }));

fs.mkdirSync(STAGES_DIR, { recursive: true });

app.get('/', (req, res) => {
    res.send(`<html>
    <head>
        <title>walter</title>
    </head>
    <body>
        <h1>walter</h1>
        <img src="/walter.png" alt="walter.png">
    </body>
</html>`)
})

app.get('/walter.png', (req, res) => {
    fs.readFile(path.join(__dirname, 'walter.png'), (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'walter died :sob::sob:' });
            }
            return res.status(500).json({ error: err.message });
        }

        res.send(data);
    });
});

app.get('/api/v1/', (req, res) => {
    res.send('fih 🥀🥀🙏🙏😭😭');
});

app.get('/api/v1/liststages', (req, res) => {
    fs.readdir(STAGES_DIR, (err, files) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(files);
    });
});

app.get('/api/v1/stage/:id', (req, res) => {
    const stageID = path.basename(req.params.id);
    const filePath = path.join(STAGES_DIR, stageID);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'Stage not found' });
            }
            return res.status(500).json({ error: err.message });
        }

        try {
            res.json(JSON.parse(data));
        } catch {
            res.status(500).json({ error: 'Invalid stage data (not JSON)' });
        }
    });
});

app.get('/api/v1/stagepopuptext/:id', (req, res) => {
    const stageID = path.basename(req.params.id);
    const filePath = path.join(STAGES_DIR, stageID);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'Stage not found' });
            }
            return res.status(500).json({ error: err.message });
        }

        try {
            res.json(JSON.parse(data).popup_text);
        } catch {
            res.status(500).json({ error: 'Invalid stage data (not JSON)' });
        }
    });
})

app.post('/api/v1/uploadstage/:id', (req, res) => {
    const stageID = path.basename(req.params.id);
    const filePath = path.join(STAGES_DIR, stageID);
    const stageData = req.body;

    if (!stageData) {
        return res.status(400).json({ error: 'No data provided' });
    }

    fs.writeFile(
        filePath,
        JSON.stringify(stageData, null, 2),
        'utf8',
        err => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Stage uploaded', id: stageID });
        }
    );
});

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});