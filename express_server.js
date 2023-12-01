const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const {
  findUserByEmail,
  generateRandomString,
  urlsForUser,
  users,
  urlDatabase,
} = require("./helpers");

const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

// MIDDLEWARE
app.use(
  cookieSession({
    name: "session",
    keys: ["abcde"],
  })
);
app.use(express.urlencoded({ extended: true }));

/////////////////////////////////////////////////////////////////////////////////
// GET /
////////////////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

/////////////////////////////////////////////////////////////////////////////////
// GET /urls
////////////////////////////////////////////////////////////////////////////////

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    const templateVars = {
      urls: urlsForUser(req.session.user_id),
      user: users[req.session.user_id],
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("<h2>Please log in first!</h2>");
  }
});

/////////////////////////////////////////////////////////////////////////////////
// GET /urls/new
////////////////////////////////////////////////////////////////////////////////

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    const templateVars = { user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

/////////////////////////////////////////////////////////////////////////////////
// GET /urls/:id
////////////////////////////////////////////////////////////////////////////////

app.get("/urls/:id", (req, res) => {
  // check if shortURL exists in database
  if (!urlDatabase[req.params.id]) {
    console.log("ShortURL not Found!", req.params.id);
    return res.send("<h2>ShortURL not Found!</h2>");
  }
  // check if user is logged in
  if (!req.session.user_id) {
    console.log("User not logged in!");
    return res.send("<h2>You are not logged in!</h2>");
  }
  // check if user owns the URL
  if (urlDatabase[req.params.id].userID === req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id],
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      userID: urlDatabase[req.params.id].userID,
    };
    res.render("urls_show", templateVars);
  } else {
    console.log("Not your shortURL", req.params.id);
    res.send("<h2>Not your shortURL<h2>");
  }
});

/////////////////////////////////////////////////////////////////////////////////
// GET /u/:id
////////////////////////////////////////////////////////////////////////////////

app.get("/u/:id", (req, res) => {
  // check if shortURL exists in database
  if (!urlDatabase[req.params.id]) {
    return res.send("<h2>ShortURL not Found!</h2>");
  }

  const longURL = `https://${urlDatabase[req.params.id].longURL}`;
  res.redirect(longURL);
});

/////////////////////////////////////////////////////////////////////////////////
// POST /urls
////////////////////////////////////////////////////////////////////////////////

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    const id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${id}`);
  } else {
    res.redirect("/login");
  }
});

/////////////////////////////////////////////////////////////////////////////////
// POST /urls/:id
////////////////////////////////////////////////////////////////////////////////

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  // check if shortURL exists in database
  if (!urlDatabase[req.params.id]) {
    return res.send("ShortURL not Found!");
  }
  // check if user is logged in
  if (!req.session.user_id) {
    return res.send("You are not logged in!");
  }
  // check if user owns the URL
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send("You do not own this URL.");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

/////////////////////////////////////////////////////////////////////////////////
// GET /login
////////////////////////////////////////////////////////////////////////////////

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

/////////////////////////////////////////////////////////////////////////////////
// GET /register
////////////////////////////////////////////////////////////////////////////////

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("register", templateVars);
});

/////////////////////////////////////////////////////////////////////////////////
// POST /login
////////////////////////////////////////////////////////////////////////////////

app.post("/login", (req, res) => {
  // pull data off the body object
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("<h2>Please enter email and passward.</h2>");
  }
  // lookup user
  const user = findUserByEmail(email, users);
  // if user does not exist
  if (!user) {
    return res
      .status(403)
      .send("<h2>This email has not been registered yet.</h2>");
  }
  // if password does not match
  const result = bcrypt.compareSync(password, user.password);
  if (!result) {
    return res.status(403).send("<h2>Incorrect password.</h2>");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

/////////////////////////////////////////////////////////////////////////////////
// POST /register
////////////////////////////////////////////////////////////////////////////////

app.post("/register", (req, res) => {
  // pull data off the body object
  const email = req.body.email;
  const password = req.body.password;
  // if we get email and password
  if (!email || !password) {
    return res.status(400).send("<h2>Please enter email and passward.</h2>");
  }
  // check if user exists
  if (findUserByEmail(email, users)) {
    return res
      .status(400)
      .send("<h2>This email has already been registered.</h2>");
  }

  const newUserID = generateRandomString();
  // update the users object
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: bcrypt.hashSync(password, 10),
  };
  // automatically log user in
  req.session.user_id = newUserID;
  res.redirect("/urls");
});

/////////////////////////////////////////////////////////////////////////////////
// POST /logout
////////////////////////////////////////////////////////////////////////////////
app.post("/logout", (req, res) => {
  // clear the cookie
  req.session = null;
  // send user back to login
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
