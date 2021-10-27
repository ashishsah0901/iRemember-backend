const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send("note");
})

module.exports = router