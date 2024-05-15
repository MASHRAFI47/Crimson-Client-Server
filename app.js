const express = require("express");
const app = express();
const jwt = require("jsonwebtoken")
const cookieParser = require('cookie-parser')

require('dotenv').config();


//cookie
app.use(cookieParser())

//cors
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://crimson-suite-server.vercel.app'],
    credentials: true,
    optionSuccessStatus: true
}

const cors = require("cors");
app.use(cors(corsOptions))

//form urlencoded
app.use(express.urlencoded({ extended: true }))
app.use(express.json())



const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).send({ message: "Unauthorized Access" })
    }
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Unauthorized Access" })
            }
            req.user = decoded

            next()
        })
    }

}


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
        // await client.connect();

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

        app.put('/rooms/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const roomBody = req.body;
            console.log(roomBody)
        })



        //roomBookings
        app.get('/roomBookings', async (req, res) => {
            const result = await roomBookings.find().toArray()
            res.send(result)
        })

        app.get('/roomBookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await roomBookings.findOne(query);
            res.send(result)
        })

        app.patch('/roomBookings/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const roomBody = req.body;
            const updateDoc = {
                $set: {
                    date: roomBody.startDate
                },
            };
            const result = await roomBookings.updateOne(query, updateDoc, options)
            res.send(result)
        })


        app.post('/roomBookings', async (req, res) => {
            const room = req.body;
            const result = await roomBookings.insertOne(room)
            res.send(result)
        })


        app.get('/myBookings/:email', verifyToken, async (req, res) => {
            const tokenEmail = req.user?.email;
            const email = req.params?.email
            if (tokenEmail !== email) {
                return res.status(403).send({ message: "Forbidden Access" })
            }

            const result = await roomBookings.find({ userEmail: email }).toArray();
            res.send(result)
        })

        app.delete('/roomBookings/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await roomBookings.deleteOne(query);
            res.send(result)
        })



        //review

        app.get('/reviews', async (req, res) => {
            const result = await reviewRooms.find().sort({ comment: 1 }).toArray();
            res.send(result)
        })


        app.post('/reviews', async (req, res) => {
            const roomReview = req.body;
            const result = await reviewRooms.insertOne(roomReview);
            res.send(result)
        })



        //jwt
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? "none" : 'strict'
            }).send({ success: true })
        })

        app.get('/logout', async (req, res) => {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? "none" : 'strict',
                maxAge: 0
            }).send({ success: true })
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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