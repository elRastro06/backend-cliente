import { ObjectId } from "mongodb";
import clientes from "./conn.mjs";
import express from "express";
import { getReviewsByReviewedID } from "./api.mjs";

const app = express.Router();

app.get("/:id/reviews", async (req, res) => {
  try {
    const reviews = await getReviewsByReviewedID(req.params.id);
    res.send(reviews).status(200);
  } catch (e) {
    res.send(e).status(500);
  }
});

app.get("/:id/reviewsavg", async (req, res) => {
  try {
    const reviews = await getReviewsByReviewedID(req.params.id);

    let reviewAvg = 0;
    reviews.forEach(p => {
      reviewAvg += p.rating;
    });
    
    reviewAvg = reviewAvg / reviews.length;

    res.send( {reviewAvg: reviewAvg } ).status(200);
  } catch (e) {
    res.send(e).status(500);
  }
});

export default app;
