const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

// MIDDLEWARE
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  let result = "";
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function findUserByEmail(email) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
}

function urlsForUser(userID) {
  const userURLs = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === userID) {
      userURLs[id] = urlDatabase[id].longURL;
    }
  }
  return userURLs;
}

// DATABASE
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "a@a.com",
    password: "123",
  },
};

// const urlDatabase = {};

// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user3RandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user3RandomID",
  },
  eNak5x: {
    longURL: "https://www.google.com",
    userID: "userRandomID",
  },
};

/////////////////////////////////////////////////////////////////////////////////
// GET /
////////////////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  const user = users[req.cookies["user_id"]];

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
  const user = users[req.cookies["user_id"]];

  if (user) {
    const templateVars = {
      urls: urlsForUser(req.cookies["user_id"]),
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("<h2>Please log in first!</h2>");
  }
});

app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    const id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"],
    };
    res.redirect(`/urls/${id}`);
  } else {
    res.redirect("/login");
  }
});
// app.post("/urls", (req, res) => {
//   const id = generateRandomString();
//   urlDatabase[id] = req.body.longURL;
//   res.redirect(`/urls/${id}`);
// });

/////////////////////////////////////////////////////////////////////////////////
// GET /urls/new
////////////////////////////////////////////////////////////////////////////////

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];

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
  console.log("Request Params ID:", req.params.id);
  console.log("URL Database:", urlDatabase);
  // check if shortURL exists in database
  if (!urlDatabase[req.params.id]) {
    console.log("ShortURL not Found!", req.params.id);
    return res.send("<h2>ShortURL not Found!</h2>");
  }
  // check if user is logged in
  if (!req.cookies["user_id"]) {
    console.log("User not logged in!");
    return res.send("You are not logged in!");
  }
  // check if user owns the URL
  if (urlDatabase[req.params.id].userID === req.cookies["user_id"]) {
    const templateVars = {
      user: users[req.cookies["user_id"]],
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      userID: urlDatabase[req.params.id].userID,
    };
    res.render("urls_show", templateVars);
  } else {
    console.log("Not your shortURL", req.params.id);
    res.send("Not your shortURL");
  }
});

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
  if (!req.cookies["user_id"]) {
    return res.send("You are not logged in!");
  }
  // check if user owns the URL
  if (urlDatabase[req.params.id].userID !== req.cookies["user_id"]) {
    return res.send("You do not own this URL.");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  // check if shortURL exists in database
  if (!urlDatabase[req.params.id]) {
    return res.send("ID not Found!");
  }

  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.status(404).send("Short URL not found.");
  }
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.cookies["user_id"]],
    email: req.body.email,
    password: req.body.password,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  // pull data off the body object
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please enter email and passward.");
  }
  // lookup user
  const user = findUserByEmail(email);
  // if user does not exist
  if (!user) {
    return res.status(403).send("This email has not been registered yet.");
  }
  // if password does not match
  if (user.password !== password) {
    return res.status(403).send("Incorrect password.");
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // clear the cookie
  res.clearCookie("user_id");
  // send user back to login
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.cookies["user_id"]],
    email: req.body.email,
    password: req.body.password,
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  // pull data off the body object
  const email = req.body.email;
  const password = req.body.password;
  // if we get email and password
  if (!email || !password) {
    return res.status(400).send("Please enter email and passward.");
  }
  // check if user exists
  if (findUserByEmail(email)) {
    return res.status(400).send("This email has already been registered.");
  }
  // create a new user object
  const newUserID = generateRandomString();
  // update the users object
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: password,
  };
  // automatically log user in
  res.cookie("user_id", newUserID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
