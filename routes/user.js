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
        global.db.all("SELECT * FROM blogSettings", function (err, settings) {
          if (err) {
            next(err); // send the error to the error handler
          } else {
            global.db.all(
              "SELECT * FROM userComments WHERE article_id = ? ORDER BY created_at DESC",
              articleId,
              function (err, comments) {
                if (err) {
                  next(err); // send the error to the error handler
                } else {
                  res.render("user-article", {
                    article: article_row,
                    blogSettings: settings,
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

// handle user liking an article
router.get("/like/:id", (req, res, next) => {
  const articleId = req.params.id;

  // Check if the user has already liked the article
  if (req.session.likes && req.session.likes.includes(articleId)) {
    // User has already liked the article, remove the like
    req.session.likes = req.session.likes.filter((id) => id !== articleId);
    global.db.run(
      "UPDATE articles SET likes = likes - 1 WHERE id = ?",
      articleId,
      function (err) {
        if (err) {
          next(err);
        } else {
          // Check if the user has also disliked the article
          if (
            req.session.dislikes &&
            req.session.dislikes.includes(articleId)
          ) {
            // User has disliked the article, remove the dislike
            req.session.dislikes = req.session.dislikes.filter(
              (id) => id !== articleId
            );
            global.db.run(
              "UPDATE articles SET dislikes = dislikes - 1 WHERE id = ?",
              articleId,
              function (err) {
                if (err) {
                  next(err);
                } else {
                  res.redirect("back");
                }
              }
            );
          } else {
            res.redirect("back");
          }
        }
      }
    );
  } else {
    // User has not liked the article, add the like
    req.session.likes = req.session.likes || [];
    req.session.likes.push(articleId);
    global.db.run(
      "UPDATE articles SET likes = likes + 1 WHERE id = ?",
      articleId,
      function (err) {
        if (err) {
          next(err);
        } else {
          // Check if the user has disliked the article
          if (
            req.session.dislikes &&
            req.session.dislikes.includes(articleId)
          ) {
            // User has disliked the article, remove the dislike
            req.session.dislikes = req.session.dislikes.filter(
              (id) => id !== articleId
            );
            global.db.run(
              "UPDATE articles SET dislikes = dislikes - 1 WHERE id = ?",
              articleId,
              function (err) {
                if (err) {
                  next(err);
                } else {
                  res.redirect("back");
                }
              }
            );
          } else {
            res.redirect("back");
          }
        }
      }
    );
  }
});

// handle user disliking an article
router.get("/dislike/:id", (req, res, next) => {
  const articleId = req.params.id;

  // Check if the user has already disliked the article
  if (req.session.dislikes && req.session.dislikes.includes(articleId)) {
    // User has already disliked the article, remove the dislike
    req.session.dislikes = req.session.dislikes.filter(
      (id) => id !== articleId
    );
    global.db.run(
      "UPDATE articles SET dislikes = dislikes - 1 WHERE id = ?",
      articleId,
      function (err) {
        if (err) {
          next(err);
        } else {
          // Check if the user has also liked the article
          if (req.session.likes && req.session.likes.includes(articleId)) {
            // User has liked the article, remove the like
            req.session.likes = req.session.likes.filter(
              (id) => id !== articleId
            );
            global.db.run(
              "UPDATE articles SET likes = likes - 1 WHERE id = ?",
              articleId,
              function (err) {
                if (err) {
                  next(err);
                } else {
                  res.redirect("back");
                }
              }
            );
          } else {
            res.redirect("back");
          }
        }
      }
    );
  } else {
    // User has not disliked the article, add the dislike
    req.session.dislikes = req.session.dislikes || [];
    req.session.dislikes.push(articleId);
    global.db.run(
      "UPDATE articles SET dislikes = dislikes + 1 WHERE id = ?",
      articleId,
      function (err) {
        if (err) {
          next(err);
        } else {
          // Check if the user has liked the article
          if (req.session.likes && req.session.likes.includes(articleId)) {
            // User has liked the article, remove the like
            req.session.likes = req.session.likes.filter(
              (id) => id !== articleId
            );
            global.db.run(
              "UPDATE articles SET likes = likes - 1 WHERE id = ?",
              articleId,
              function (err) {
                if (err) {
                  next(err);
                } else {
                  res.redirect("back");
                }
              }
            );
          } else {
            res.redirect("back");
          }
        }
      }
    );
  }
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
        res.redirect("back");
      }
    }
  );
});

module.exports = router;
