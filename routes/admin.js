// Imports
const express = require("express");
const router = express.Router();
const assert = require("assert");
const passport = require("passport");
let blog_settings = null;

// home page
router.get("/", ensureAuthenticated, (req, res, next) => {
  fetchBlogSettings(function (err, settings) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      global.db.all("SELECT * FROM articles", function (err, rows) {
        if (err) {
          next(err); //send the error on to the error handler
        } else {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.render("admin-home", {
            articles: rows,
            user: req.user,
            activePage: "admin",
            blog_settings: settings, // Use the retrieved settings instead of blog_settings variable
          });
        }
      });
    }
  });
});

// settings page
router.get("/settings", ensureAuthenticated, (req, res, next) => {
  global.db.all("SELECT * FROM blog_settings", function (err, rows) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.render("admin-settings", { blog_settings: rows });
    }
  });
});

router.post("/update-settings", ensureAuthenticated, (req, res, next) => {
  const newTitle = req.body.title;
  const newSubtitle = req.body.subtitle;
  const newAuthor = req.body.author;
  global.db.run(
    "UPDATE blog_settings SET title = ?, subtitle = ?, author = ? ",
    [newTitle, newSubtitle, newAuthor],
    function (err) {
      if (err) {
        next(err);
      } else {
        res.redirect("/admin/settings");
      }
    }
  );
});

// article editing page
router.get("/edit-articles/:id?", ensureAuthenticated, (req, res, next) => {
  const articleId = req.params.id;
  fetchBlogSettings(function (err, settings) {
    if (err) {
      next(err);
    } else {
      if (articleId) {
        // Existing article, fetch data from the database
        global.db.get(
          "SELECT * FROM articles WHERE id = ?",
          articleId,
          function (err, row) {
            if (err) {
              next(err); // Send the error to the error handler
            } else {
              res.setHeader(
                "Cache-Control",
                "no-cache, no-store, must-revalidate"
              );
              res.render("admin-edit-article", {
                blog_settings: settings,
                article: row,
              });
            }
          }
        );
      } else {
        // New draft, no article ID provided
        const emptyArticle = { title: "", subtitle: "", content: "" };
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.render("admin-edit-article", {
          blog_settings: settings,
          article: emptyArticle,
        });
      }
    }
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error logging out", err);
    }
    res.redirect("/admin/login");
  });
});

router.post("/add-article", ensureAuthenticated, (req, res, next) => {
  const title = req.body.title;
  const subtitle = req.body.subtitle;
  const content = req.body.content;
  global.db.run(
    "INSERT INTO articles(title,subtitle,content,author,publication_date, last_modified, draft_or_published,image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    title,
    subtitle,
    content,
    req.user.username,
    formatDate(Date.now()),
    formatDate(Date.now()),
    "draft",
    "",
    function (err) {
      if (err) {
        next(err);
      } else {
        res.redirect("/admin");
      }
    }
  );
});

router.post("/update-article/:id", ensureAuthenticated, (req, res, next) => {
  const title = req.body.title;
  const subtitle = req.body.subtitle;
  const content = req.body.content;
  const articleId = req.params.id;
  global.db.run(
    "UPDATE articles SET title = ?, subtitle = ?, content = ?, last_modified = ? WHERE id = ?",
    title,
    subtitle,
    content,
    formatDate(Date.now()),
    articleId,
    function (err) {
      if (err) {
        next(err);
      } else {
        res.redirect("/admin");
      }
    }
  );
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
    "UPDATE articles SET draft_or_published = 'published' WHERE id = ?",
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

function fetchBlogSettings(callback) {
  if (blog_settings) {
    // If the blog settings are already retrieved, return them immediately
    callback(null, blog_settings);
  } else {
    global.db.all("SELECT * FROM blog_settings", function (err, rows) {
      if (err) {
        console.log(err);
        callback(err, null); // Pass the error to the callback
      } else {
        blog_settings = rows; // Store the retrieved rows in the global variable
        callback(null, rows); // Pass the rows to the callback
      }
    });
  }
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/admin/login");
}

function formatDate(date) {
  const d = new Date(date);

  // Get day, month, and year
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = d.getFullYear();

  // Format the date as dd-mm-yyyy
  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
}

module.exports = router;
