const express = require("express");
const app = express();

app.get('/', (req, res) => {
    res.send("Crimson Suite Server is Running")
})

module.exports = app;