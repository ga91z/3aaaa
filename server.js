const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle form submission
app.post('/submit', (req, res) => {
  const { name, accepted } = req.body;

  if (!name || !accepted) {
    return res.status(400).send('Missing name or acceptance.');
  }

  const entry = `Name: ${name}, Accepted: ${accepted}, Date: ${new Date().toISOString()}\n`;

  fs.appendFile('submissions.txt', entry, (err) => {
    if (err) {
      console.error('Error saving submission:', err);
      return res.status(500).send('Error saving submission.');
    }
    res.send('Submission saved.');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
