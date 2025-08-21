const express = require('express');
const router = express.Router();

// Placeholder route
router.get('/', (req, res) => {
  res.send('Vehicle route working');
});

module.exports = router;