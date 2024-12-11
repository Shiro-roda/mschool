// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve the correct directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the provided absolute path for the static directory
const staticDir = 'C:/Users/admin/OneDrive/MSchoolWeb/experimental/project-root_new';

// Serve static files from the correct directory
app.use(express.static(staticDir));

// Default route (serve index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
