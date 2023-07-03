// Imports
const express = require("express");
const router = express.Router();
const assert = require("assert");
const passport = require("passport");

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error logging out", err);
    }
    res.redirect("/admin/login");
  });
});

router.get("/login", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.render("admin-login", { user: req.user });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Authentication failed
      console.log("Authentication failed");
      return res.redirect("/admin/login");
    }
    // Authentication successful
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/admin");
    });
  })(req, res, next);
});

router.get("/", ensureAuthenticated, (req, res, next) => {
  global.db.all("SELECT * FROM articles", function (err, rows) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.render("admin-home", { articles: rows, user: req.user });
    }
  });
});
// delete article from database
router.post("/articles/:id/delete", ensureAuthenticated, (req, res, next) => {
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
router.post("/articles/:id/publish", ensureAuthenticated, (req, res, next) => {
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

router.get("/settings", ensureAuthenticated, (req, res) => {
  res.render("admin-settings");
});

router.get("/edit-articles", ensureAuthenticated, (req, res) => {
  res.render("admin-edit-article");
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/admin/login");
}

module.exports = router;
