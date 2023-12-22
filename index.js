require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://task-fusion-ba7f0.web.app",
    "https://task-fusion-ba7f0.firebaseapp.com",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(express.json());
app.use(cors(corsOptions));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2mr4msx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const userCollection = client.db("taskDB").collection("users");
    const toDoCollection = client.db("taskDB").collection("toDo");
    const onGoingCollection = client.db("taskDB").collection("onGoing");
    const completeCollection = client.db("taskDB").collection("complete");

    //   user apis

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "User already exist.", insertedId: null });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // toDo apis

    app.get("/toDo", verifyToken, verifyAdmin, async (req, res) => {
      const result = await toDoCollection.find().toArray();
      res.send(result);
    });

    app.post("/toDo", async (req, res) => {
      const toDoItem = req.body;
      const result = await toDoCollection.insertOne(toDoItem);
      res.send(result);
    });

    app.delete("/toDo/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toDoCollection.deleteOne(query);
      res.send(result);
    });

    // onGoing apis

    app.get("/onGoing", verifyToken, verifyAdmin, async (req, res) => {
      const result = await onGoingCollection.find().toArray();
      res.send(result);
    });

    app.post("/onGoing", async (req, res) => {
      const onGoingItem = req.body;
      const result = await onGoingCollection.insertOne(onGoingItem);
      res.send(result);
    });

    app.delete("/onGoing/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await onGoingCollection.deleteOne(query);
      res.send(result);
    });

    // complete apis

    app.get("/complete", verifyToken, verifyAdmin, async (req, res) => {
      const result = await completeCollection.find().toArray();
      res.send(result);
    });

    app.post("/complete", async (req, res) => {
      const completeItem = req.body;
      const result = await completeCollection.insertOne(completeItem);
      res.send(result);
    });

    app.delete("/complete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await completeCollection.deleteOne(query);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Fusion server in running");
});

app.listen(port, () => {
  console.log(`Task Fusion server is running on port ${port}`);
});
