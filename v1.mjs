import { ObjectId } from "mongodb";
import clientes from "./conn.mjs";
import express from "express";
import axios from "axios";
import "dotenv/config";

const app = express.Router();

const products = process.env.PRODUCTS != undefined ? process.env.PRODUCTS : "localhost";
const clients = process.env.PRODUCTS != undefined ? process.env.CLIENTS : "localhost";

const verifyToken = async (req, res, next) => {
    try {
        const response = await axios.get(`http://${clients}:5000/checkToken/${req.headers.authorization}`);
        const user = response.data.user;

        if (req.method == 'PUT' && req.method == 'DELETE' && req.params.id != user._id) {
            res.status(402).send("Unauthorized action");
            return;
        } else if (req.method == 'DELETE' && req.params.id == undefined) {
            res.status(402).send("Unauthorized action");
            return;
        }

        next();
    } catch {
        res.status(401).send({ error: "Invalid token" });
    }
}

app.get("/", verifyToken, async (req, res) => {
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

        if (queries.product) {
            const result_product_api = await axios.get(
                `http://${products}:5001/v1/?name=${queries.product}`
            );

            const result_product = await result_product_api.json();
            const users_id = result_product.map(
                (product) => new ObjectId(product.userID)
            );
            filtro = { ...filtro, _id: { $in: users_id } };
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

app.get("/:id", verifyToken, async (req, res) => {
    try {
        const result = await clientes.findOne({ _id: new ObjectId(req.params.id) });
        res.send(result).status(200);
    } catch (e) {
        res.send(e).status(500);
    }
});

app.delete("/:id", verifyToken, async (req, res) => {
    try {
        const result = await clientes.deleteOne({
            _id: new ObjectId(req.params.id),
        });
        res.send(result).status(200);
    } catch (e) {
        res.send(e).status(500);
    }
});

app.delete("/", verifyToken, async (req, res) => {
    try {
        let result = await clientes.deleteMany(req.body);
        res.send(result).status(200);
    } catch (e) {
        res.send(e).status(500);
    }
});

app.put("/:id", verifyToken, async (req, res) => {
    try {
        const cliente = req.body;

        if (cliente.lat != undefined && cliente.long != undefined) {
            // insert the location as a GeoJSON object
            cliente.location = {
                type: "Point",
                coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)],
            };
            // delete the long and lat fields
            delete cliente.long;
            delete cliente.lat;
        }

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
