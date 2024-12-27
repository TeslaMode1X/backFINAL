const mongoose = require('mongoose');

const uri = process.env.MONGO_JS_CONNECTION;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
    });

module.exports = mongoose;
