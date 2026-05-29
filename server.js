const express = require('express');
const app = express();
const port = 3000;

app.get('/simple-api', (req, res) => {
  res.json({ result: 81 });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});