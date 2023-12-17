import express from "express";
import v1 from "./v1.mjs";
import v2 from "./v2.mjs";
import cors from "cors";
import axios from "axios";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});

const clients =
  process.env.CLIENTS != undefined ? process.env.CLIENTS : "localhost";

const verifyToken = async (req, res, next) => {
  try {
    if (req.headers.authorization != process.env.GOOGLE_CLIENT_ID) {
      const response = await axios.get(
        `http://${clients}:5000/checkToken/${req.headers.authorization}`
      );
      const user = response.data.user;

      if (
        (req.method == "PUT" || req.method == "DELETE") &&
        req.params.id != user._id
      ) {
        res.status(402).send("Unauthorized action");
        return;
      } else if (req.method == "DELETE" && req.params.id == undefined) {
        res.status(402).send("Unauthorized action");
        return;
      }
    }

    next();
  } catch {
    res.status(401).send({ error: "Invalid token" });
  }
};

app.get("/checkToken/:token", async (req, res) => {
  const token = req.params.token;
  const response = await axios.get(
    `http://${clients}:5000/v1/?oauthToken=${token}`,
    {
      headers: {
        Authorization: process.env.GOOGLE_CLIENT_ID,
      },
    }
  );
  const user = response.data[0];

  if (user == undefined) {
    //There is no user with the specified token
    res.status(401).send({ error: "Invalid token" });
  } else {
    //A user was found with that token, we have to check if the token is still valid
    const epochNow = Math.floor(new Date().getTime() / 1000.0);
    if (epochNow < user.exp) {
      res.status(200).send({ information: "Valid token", user: user });
    } else {
      res.status(401).send({ error: "Expired token" });
    }
  }
});

app.use("/v1", verifyToken, v1);
app.use("/v2", verifyToken, v2);
