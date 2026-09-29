const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Booking Service: MongoDB connected");
    } catch (error) {
        console.error("Booking Service: MongoDB connection failed");
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;