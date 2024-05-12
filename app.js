const express = require("express");
const app = express();

require('dotenv').config();

const cors = require("cors");
app.use(cors())

app.use(express.urlencoded({extended: true}))
app.use(express.json())



app.get('/', (req, res) => {
    res.send("Crimson Suite Server is Running")
})

module.exports = app;