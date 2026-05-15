const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for unknown routes (optional for SPA-like feel, 
// but since we are doing multi-page, we'll let Express handle individual files)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
