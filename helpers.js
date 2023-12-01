const users = {};
const urlDatabase = {};

const findUserByEmail = function (email, database) {
  for (const userID in database) {
    if (database[userID].email === email) {
      return database[userID];
    }
  }
  return null;
};

function generateRandomString() {
  let result = "";
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
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

module.exports = {
  findUserByEmail,
  generateRandomString,
  urlsForUser,
  users,
  urlDatabase,
};
