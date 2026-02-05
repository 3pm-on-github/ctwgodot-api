const {
  TextCensor,
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers
} = require('obscenity');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 7000;
const HOST = process.env.HOST || '0.0.0.0';
const STAGES_DIR = path.join(__dirname, '..', 'db', 'stages');

const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });
const asteriskStrategy = (ctx) => '🐈'.repeat(ctx.matchLength);
const censor = new TextCensor().setStrategy(asteriskStrategy);

fs.mkdirSync(STAGES_DIR, { recursive: true });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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

app.get('/api/v1/stageinfo/:id', (req, res) => {
    const stageID = path.basename(req.params.id);
    const filePath = path.join(STAGES_DIR, "..", "stageinfo.json");

    fs.readFile(filePath, 'utf8', (err, data) => {
        try {
            res.json(JSON.parse(data)[stageID]);
        } catch {
            res.status(500).json({ error: 'Stage doesn\'t exist' });
        }
    });
})

app.use(express.text({
    type: 'text/*',
    limit: '10mb'
}));
app.post('/api/v1/uploadstage/:id', (req, res) => {
    const stageID = path.basename(req.params.id);
    const filePath = path.join(STAGES_DIR, stageID);
    const stageData = req.body;

    if (!stageData) {
        return res.status(400).json({ error: 'No data provided' });
    }

    // censor popup text and author name
    var parsedData = JSON.parse(stageData);
    const popuptext = parsedData.popup_text || "Default";
    const matches = matcher.getAllMatches(popuptext);
    const authorname = parsedData.author || "Wawa Clicker";
    const matches2 = matcher.getAllMatches(authorname);
    const cleanauthor = censor.applyTo(authorname, matches2);
    const cleanpopuptext = censor.applyTo(popuptext, matches)

    // update parsedData with censored text
    console.log("censored popup text:", cleanpopuptext);
    console.log("censored author name:", cleanauthor);
    parsedData.popup_text = cleanpopuptext;
    parsedData.author = cleanauthor;

    // update stageinfo.json
    const rating = parsedData.rating || 1.00;
    const stageinfo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'db', 'stageinfo.json'), 'utf8'));
    stageinfo[stageID] = {"author": cleanauthor,"rating": rating}
    
    // write to stageinfo.json
    fs.writeFileSync(path.join(__dirname, '..', 'db', 'stageinfo.json'), JSON.stringify(stageinfo, null, 2), 'utf8');

    // write to stage file
    fs.writeFile(filePath, JSON.stringify(parsedData, null, 2), 'utf8', err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Stage uploaded', id: stageID });
    });
});


server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});