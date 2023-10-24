const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://afr012240:mongo@clusteriw.9j6wq5e.mongodb.net/?retryWrites=true&w=majority";
const app = express();
const port = 5000;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.get("/", (req, res) => {
      res.send("Hello, I am the Product Backend!");
    });

    app.get("/json", (req, res) => {
      res.json({
        pepe: "soy tontito",
        anotherKey: "antonio caca",
        moreData: {
          nestedKey: "nestedValue",
          arrayKey: [1, 2, 3],
        },
      });
    });

    app.get("/pepe", (req, res) => {
      res.send("pepe");
    });

    app.listen(port, () => {
      console.log(`Now listening on port ${port}`);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
