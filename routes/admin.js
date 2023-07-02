// Imports
const express = require("express");
const router = express.Router();
const assert = require("assert");

router.get("/", (req, res) => {
  res.render("admin-home");
});

router.get("/settings", (req, res) => {
  res.render("admin-settings");
});

router.get("/edit-article", (req, res) => {
  res.render("admin-edit-article");
});

module.exports = router;
