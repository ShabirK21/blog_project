const express = require("express");
const app = express();
const port = 3000;
const sqlite3 = require("sqlite3").verbose();

//items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database("./database.db", function (err) {
  if (err) {
    console.error(err);
    process.exit(1); //Bail out we can't connect to the DB
  } else {
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON"); //This tells SQLite to pay attention to foreign key constraints
  }
});

const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
//set the app to use ejs for rendering
app.set("view engine", "ejs");
//use public folder for static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//user landing page
app.get("/", (req, res, next) => {
  global.db.all("SELECT * FROM articles", function (err, articleRows) {
    if (err) {
      next(err); // send the error to the error handler
    } else {
      global.db.all("SELECT * FROM blog_settings", function (err, settings) {
        if (err) {
          next(err); // send the error to the error handler
        } else {
          res.render("user-home", {
            articles: articleRows,
            blog_settings: settings,
          });
        }
      });
    }
  });
});

// require admin authentication
require("./admin-authentication")(app, global.db);

//this adds all the userRoutes to the app under the path /user
app.use("/user", userRoutes);
//this adds all the adminRoutes to the app under the path /admin
app.use("/admin", adminRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
