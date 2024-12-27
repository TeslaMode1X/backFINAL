const mongoose = require('mongoose');

// Mongo connection url from .env file
const uri = process.env.MONGO_JS_CONNECTION;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
    });

// Returning mongo connection
module.exports = mongoose;
