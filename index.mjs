import { ObjectId } from "mongodb";
import clientes from "./conn.mjs";
import express from "express";

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});

app.get("/", async (req, res) => {
  try {
    let results = await clientes.find({}).toArray();
    res.send(results).status(200);
  } catch (e) {
    res.send(e).status(500);
  }
});

app.post("/", async (req, res) => {
  try {
    const cliente = req.body;
    const result = await clientes.insertOne(cliente);
    res.send(result).status(200);
  } catch (e) {
    res.send(e).status(500);
  }
});

app.get("/:id", async (req, res) => {
  try {
    const result = await clientes.findOne({ _id: new ObjectId(req.params.id) });
    res.send(result).status(200);
  } catch (e) {
    res.send(e).status(500);
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const result = await clientes.deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result).status(200);
  } catch (e) {
    res.send(e).status(500);
  }
});

app.delete("/", async (req, res) => {
  try {
    let result = await clientes.deleteMany(req.body);
    res.send(result).status(200);
  } catch (e) {
    res.send(e).status(500);
  }
});

app.put("/:id", async (req, res) => {
  try {
    const result = await clientes.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.send(result).status(200);
  } catch (e) {
    res.send(e).status(500);
  }
});
