import { ObjectId } from "mongodb";
import clientes from "./conn.mjs";
import express from "express";

const app = express.Router();

app.get("/", async (req, res) => {
  try {
    let filtro = {};
    let orden = {};

    const queries = req.query;

    if (queries.name) {
      filtro = { ...filtro, name: queries.name };
    }
    if (queries.email) {
      filtro = { ...filtro, email: queries.email };
    }
    if (queries.googleID) {
      filtro = { ...filtro, googleID: queries.googleID };
    }
    if (queries.oauthToken) {
      filtro = { ...filtro, oauthToken: queries.oauthToken };
    }

    if (queries.long && queries.lat && queries.radius) {
      filtro = {
        ...filtro,
        location: {
          $geoWithin: {
            $centerSphere: [
              [parseFloat(queries.long), parseFloat(queries.lat)],
              queries.radius / 6371,
            ],
          },
        },
      };
    }

    if (queries.orderBy && queries.order) {
      if (queries.order == "asc") {
        orden = { ...orden, [queries.orderBy]: 1 };
      } else if (queries.order == "desc") {
        orden = { ...orden, [queries.orderBy]: -1 };
      }
    }

    let results = await clientes.find(filtro).sort(orden).toArray();
    res.send(results).status(200);
  } catch (e) {
    console.log(e);
    res.send(e).status(500);
  }
});

app.post("/", async (req, res) => {
  try {
    const cliente = req.body;
    // insert the location as a GeoJSON object
    cliente.location = {
      type: "Point",
      coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)],
    };
    // delete the long and lat fields
    delete cliente.long;
    delete cliente.lat;
    const result = await clientes.insertOne(cliente);
    res.send(result).status(200);
  } catch (e) {
    console.log(e);
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
    const result = await clientes.deleteOne({
      _id: new ObjectId(req.params.id),
    });
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
    const cliente = req.body;
    // insert the location as a GeoJSON object
    cliente.location = {
      type: "Point",
      coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)],
    };
    // delete the long and lat fields
    delete cliente.long;
    delete cliente.lat;

    const result = await clientes.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: cliente }
    );
    res.send(result).status(200);
  } catch (e) {
    res.send(e).status(500);
  }
});

export default app;
