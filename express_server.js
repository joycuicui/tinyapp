const express = require("express");
const PORT = 8080; // default port 8080

const app = express();
app.set("view engine", "ejs");

// MIDDLEWARE
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

// DATABASE
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
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

// Listen Handler
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
