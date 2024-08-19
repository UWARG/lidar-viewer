const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());

// Function to read and parse the log file
async function readLogFile() {
    try {
        const data = await fs.readFile('./scans.json', 'utf8');
        const lidarData = JSON.parse(data);
        return lidarData;
    } catch (err) {
        console.error('Error reading or parsing the file:', err);
        throw err; // Re-throw the error to be handled by the caller
    }
}

app.get('/api/scan_data', async (req, res) => {
  const data = await readLogFile();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});