// Imports
const express = require("express");
const router = express.Router();
const assert = require("assert");

router.get("/", (req, res, next) => {
  global.db.all("SELECT * FROM articles", function (err, rows) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      res.render("admin-home", { articles: rows });
    }
  });
});
// delete article from database
router.post("/articles/:id/delete", (req, res, next) => {
  const articleId = req.params.id;
  global.db.run("DELETE FROM articles WHERE id = ?", articleId, function (err) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      res.redirect("/admin");
    }
  });
});
// publish article
router.post("/articles/:id/publish", (req, res, next) => {
  const articleId = req.params.id;
  global.db.run(
    "UPDATE articles SET draft_published = 'published' WHERE id = ?",
    articleId,
    function (err) {
      if (err) {
        next(err); //send the error on to the error handler
      } else {
        res.redirect("/admin");
      }
    }
  );
});

router.get("/settings", (req, res) => {
  res.render("admin-settings");
});

router.get("/edit-articles", (req, res) => {
  res.render("admin-edit-article");
});

module.exports = router;
