// Imports
const express = require("express");
const router = express.Router();
const assert = require("assert");

router.get("/article/:id", (req, res, next) => {
  const articleId = req.params.id;

  global.db.get(
    "SELECT * FROM articles WHERE id = ?",
    articleId,
    function (err, article_row) {
      if (err) {
        next(err); // send the error to the error handler
      } else {
        global.db.all("SELECT * FROM blog_settings", function (err, settings) {
          if (err) {
            next(err); // send the error to the error handler
          } else {
            global.db.all(
              "SELECT * FROM userComments WHERE article_id = ?",
              articleId,
              function (err, comments) {
                if (err) {
                  next(err); // send the error to the error handler
                } else {
                  res.render("user-article", {
                    article: article_row,
                    blog_settings: settings,
                    comments: comments,
                  });
                }
              }
            );
          }
        });
      }
    }
  );
});

router.post("/like/:id", (req, res, next) => {
  const articleId = req.params.id;
  global.db.run(
    "UPDATE articles SET likes = likes + 1 WHERE id = ?",
    articleId,
    function (err) {
      if (err) {
        next(err);
      } else {
        res.redirect("/");
      }
    }
  );
});

router.post("/comment/:id", (req, res, next) => {
  const articleId = req.params.id;
  const comment = req.body.comment;
  global.db.run(
    "INSERT INTO userComments (article_id,comment) VALUES (?, ?)",
    articleId,
    comment,
    function (err) {
      if (err) {
        next(err);
      } else {
        res.redirect("/user/article/" + articleId);
      }
    }
  );
});

module.exports = router;
