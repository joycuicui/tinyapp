const express = require("express");
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

const app = express();
app.set("view engine", "ejs");

// MIDDLEWARE
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  // return Math.random().toString(36).slice(2, 8);
  let result = "";
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    // Math.random() * characters.length scales the random number to
    // a range between 0 (inclusive) and characters.length (exclusive)
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function emailExist(email) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
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
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.status(404).send("Short URL not found.");
  }
  res.redirect(longURL);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  urlDatabase[id] = newLongURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const user_id = req.body["user_id"];
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    email: req.body.email,
    password: req.body.password,
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please enter email and passward.");
  }

  if (emailExist) {
    return res.status(400).send("This email has already been registered.");
  }

  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: password,
  };
  res.cookie("user_id", newUserID);
  res.redirect("/urls");
});

// Listen Handler
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
