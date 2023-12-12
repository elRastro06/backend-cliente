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

const clients = process.env.CLIENTS != undefined ? process.env.CLIENTS : "localhost";

app.get("/checkToken/:token", async (req, res) => {
  const token = req.params.token;
  const response = await axios.get(`http://${clients}:5000/v1/?oauthToken=${token}`);
  const user = response.data[0];

  if (user == undefined) {
    //There is no user with the specified token
    console.log("Invalid token");
    res.status(401).send({ error: "Invalid token" });
  } else {
    //A user was found with that token, we have to check if the token is still valid
    const epochNow = Math.floor(new Date().getTime()/1000.0);
    if (epochNow < user.exp) {
      res.status(200).send({ information: "Valid token" });
    } else {
      res.status(401).send({ error: "Expired token" });
    }
  }
});

app.use("/v1", v1);
app.use("/v2", v2);