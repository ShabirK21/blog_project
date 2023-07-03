const express = require("express");
const app = express();
const port = 3000;
const sqlite3 = require("sqlite3").verbose();

const session = require("express-session");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
app.use(express.urlencoded({ extended: true }));
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

//user landing page
app.get("/", (req, res) => {
  res.render("home");
});

app.use(
  session({
    secret: "abc123abc123qwe123",
    resave: false,
    saveUninitialized: false,
  })
);

passport.serializeUser((admin, done) => {
  done(null, admin.id);
});

passport.deserializeUser((id, done) => {
  global.db.get("SELECT * FROM admins WHERE id = ?", id, (err, admin) => {
    if (err) {
      console.error("Error deserializing user:", err);
      return done(err);
    }
    done(null, admin);
  });
});

app.use(passport.initialize());
app.use(passport.session());

//this adds all the userRoutes to the app under the path /user
//app.use("/user", userRoutes);
//this adds all the adminRoutes to the app under the path /admin
app.use("/admin", adminRoutes);

passport.use(
  new LocalStrategy((username, password, done) => {
    global.db.get(
      "SELECT * FROM admins WHERE username = ?",
      username,
      (err, admin) => {
        if (err) return done(err);
        if (!admin) return done(null, false);
        bcrypt.compare(password, admin.password, (err, res) => {
          if (err) return done(err);
          if (!res) return done(null, false);
          return done(null, admin);
        });
      }
    );
  })
);

/*
const username = "admin";
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const password = "password123";
const id = 1;
const hash = bcrypt.hashSync(password, salt);
const query = `INSERT INTO admins (username, password) VALUES (?, ?)`;
global.db.run(query, [username, hash], function (err) {
  if (err) {
    console.error(err.message);
  } else {
    console.log(`Admin user created with ID: ${this.lastID}`);
  }
});

global.db.close();
*/
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
