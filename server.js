const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // npm install node-fetch@2
const app = express();

const PORT = 3000;

// Your GitHub details here:
const GITHUB_TOKEN = 'your_github_token_here';  // Replace with your token
const OWNER = 'ga91z';
const REPO = '3aaaa';
const FILE_PATH = 'submissions.txt';
const BRANCH = 'main';

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from 'public' folder (your HTML, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Handle form submission
app.post('/submit', async (req, res) => {
  const { name, accepted } = req.body;

  if (!name || !accepted) {
    return res.status(400).send('يرجى إدخال الاسم والموافقة على الشروط.');
  }

  try {
    // 1. Get current submissions.txt content and SHA from GitHub
    const getUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
    const getResponse = await fetch(getUrl, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });

    if (!getResponse.ok) {
      return res.status(500).send('فشل في جلب محتوى الملف من GitHub.');
    }

    const fileData = await getResponse.json();

    // Decode base64 content to text
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

    // Prepare new entry
    const entry = `Name: ${name}, Accepted: ${accepted}, Date: ${new Date().toISOString()}\n`;

    // Append new entry
    const newContent = currentContent + entry;

    // Encode updated content to base64
    const encodedContent = Buffer.from(newContent).toString('base64');

    // 2. Update the file on GitHub
    const updateResponse = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `إضافة اسم جديد: ${name}`,
        content: encodedContent,
        sha: fileData.sha,
        branch: BRANCH
      })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      return res.status(500).send('فشل في تحديث الملف: ' + (errorData.message || ''));
    }

    res.send('تم تسجيل اسمك بنجاح. شكراً لموافقتك.');

  } catch (error) {
    console.error(error);
    res.status(500).send('حدث خطأ غير متوقع.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
