const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'FreeBosh API is running' });
});

app.listen(PORT, () => {
  console.log(`FreeBosh API listening on port ${PORT}`);
});