// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve the correct directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the provided absolute path for the static directory
const staticDir = 'C:/Users/admin/OneDrive/MSchoolWeb/experimental/project-root_new';

// Feedback file path
const feedbackFile = path.join(staticDir, 'feedback.json');

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the correct directory
app.use(express.static(staticDir));

// Default route (serve index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Endpoint to receive feedback
app.post('/submit-feedback', (req, res) => {
  const feedback = req.body.feedback;
  const timestamp = new Date().toISOString();

  if (!feedback) {
    return res.status(400).json({ error: 'Feedback is required.' });
  }

  // Load existing feedback
  let feedbackData = [];
  if (fs.existsSync(feedbackFile)) {
    feedbackData = JSON.parse(fs.readFileSync(feedbackFile, 'utf8'));
  }

  // Append new feedback
  feedbackData.push({ feedback, timestamp });

  // Save feedback back to file
  fs.writeFileSync(feedbackFile, JSON.stringify(feedbackData, null, 2));
  console.log('Feedback saved:', feedback);

  res.json({ message: 'Feedback submitted successfully.' });
});

// Endpoint to retrieve feedback
app.get('/view-feedback', (req, res) => {
  if (!fs.existsSync(feedbackFile)) {
    return res.json([]);
  }
  const feedbackData = JSON.parse(fs.readFileSync(feedbackFile, 'utf8'));
  res.json(feedbackData);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
