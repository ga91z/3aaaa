const fetch = require('node-fetch');

const GITHUB_TOKEN = 'your_github_token_here';
const OWNER = 'ga91z';
const REPO = '3aaaa';
const FILE_PATH = 'submissions.txt';
const BRANCH = 'main';

app.post('/submit', async (req, res) => {
  const { name, accepted } = req.body;

  if (!name || !accepted) {
    return res.status(400).send('Missing name or acceptance.');
  }

  try {
    // 1. Get current file content and sha from GitHub
    const getUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
    const getResponse = await fetch(getUrl, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });

    if (!getResponse.ok) {
      return res.status(500).send('Failed to fetch file info from GitHub.');
    }

    const fileData = await getResponse.json();
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

    // 2. Append new submission
    const entry = `Name: ${name}, Accepted: ${accepted}, Date: ${new Date().toISOString()}\n`;
    const newContent = currentContent + entry;

    // 3. Encode new content to base64
    const encodedContent = Buffer.from(newContent).toString('base64');

    // 4. Update the file on GitHub
    const updateResponse = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Add submission: ${name}`,
        content: encodedContent,
        sha: fileData.sha,
        branch: BRANCH
      })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      return res.status(500).send('Failed to update file: ' + (errorData.message || ''));
    }

    res.send('Submission saved to GitHub successfully.');

  } catch (error) {
    console.error(error);
    res.status(500).send('Unexpected error occurred.');
  }
});
