import { ObjectId } from "mongodb";
import clientes from "./conn.mjs";
import express from "express";
import { getReviewsByReviewedID } from "./api.mjs";

const app = express.Router();

app.get("/:id/reviews", async (req, res) => {
  try {
    const pujas = await getReviewsByReviewedID(req.params.id);
    res.send(pujas).status(200);
  } catch (e) {
    res.send(e).status(500);
  }
});

export default app;
