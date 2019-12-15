const express = require("express");
const sum = require("./count");
const router = express.Router();

router.get("/", (req, res) => {
  res.send(sum);
});

module.exports = router;
