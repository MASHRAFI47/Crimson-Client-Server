const express = require("express");
const app = express();

require('dotenv').config();

const cors = require("cors");
app.use(cors())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iduz7rm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const roomsCollection = client.db("crimsonSuite").collection("rooms");
        const roomBookings = client.db("crimsonSuite").collection("roomBookings");
        const reviewRooms = client.db("crimsonSuite").collection("reviewRooms");

        app.get('/rooms', async (req, res) => {
            const result = await roomsCollection.find().toArray()
            res.send(result)
        })

        app.get('/rooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await roomsCollection.findOne(query)
            res.send(result)
        })

        app.put('/rooms/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const options = { upsert: true };
            const roomBody = req.body;
            console.log(roomBody)
        })


        app.get('/roomBookings/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await roomBookings.findOne(query);
            res.send(result)
        })


        app.post('/roomBookings', async(req, res) => {
            const room = req.body;
            const result = await roomBookings.insertOne(room)
            res.send(result)
        })


        app.get('/myBookings/:email', async(req, res) => {
            const result = await roomBookings.find({userEmail: req.params.email}).toArray();
            res.send(result)
        })

        app.delete('/roomBookings/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await roomBookings.deleteOne(query);
            res.send(result)
        })



        //review
        app.post('/reviews', async(req, res) => {
            const roomReview = req.body;
            const result = await reviewRooms.insertOne(roomReview);
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Crimson Suite Server is Running")
})

module.exports = app;