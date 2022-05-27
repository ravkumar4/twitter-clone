const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "twitterClone.db");

let db = null;
let jwtToken;

const dbInitialization = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running...");
    });
  } catch (err) {
    console.log(`Error is ${err.message}`);
    process.exit(1);
  }
};

dbInitialization();

const validatePassword = (password) => {
  return password.length > 6;
};

function authenticateFunction(request, response, next) {
  const authHeader = request.headers["authorization"];
  let token;
  if (authHeader !== undefined) {
    token = authHeader.split(" ")[1];
  }
  if (token === undefined) {
    response.status(400);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(token, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(400);
        response.send("JWT Token Verification Failed");
      } else {
        next();
      }
    });
  }
}

// API 1
app.post("/register/", async (request, response) => {
  const { name, username, password, gender } = request.body;
  //const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `
        SELECT * FROM 
            user 
        WHERE 
            username = '${username}';`;
  const databaseUser = await database.get(selectUserQuery);

  if (databaseUser !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    if (validatePassword(password)) {
      response.status(400);
      response.send("User Created Successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  }
});

// API 2 LOGIN

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  console.log(username);
  console.log(password);
  const selectUserQuery = `
        SELECT * FROM 
            user 
        WHERE 
            username = '${username}';`;
  const databaseUser = await database.get(selectUserQuery);
  console.log(databaseUser);
  if (databaseUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      databaseUser.password
    );
    console.log(isPasswordMatched);
    if (isPasswordMatched === false) {
      response.status(400);
      response, send("Invalid Password");
    } else {
      const payload = { username: username };
      jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send(jwtToken);
    }
  }
});

// API 3

app.get(
  "/user/tweets/feed/",
  authenticateFunction,
  async (request, response) => {
    const getLatestTweetsQuery = `
        SELECT
            user.username, 
            tweet.tweet, 
            tweet.date_time
        FROM
            user 
        NATURAL JOIN
            tweet
        WHERE 
            username = '%{username}'
        ORDER BY 
            '${dateTIme}' DESC
        LIMIT 
            4
    `;
    const getResponse = await db.all(getLatestTweetsQuery);
    response.send(getResponse);
  }
);
