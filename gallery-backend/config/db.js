// config/db.js
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first"); // guards against IPv6-first DNS hangs
                                          // on some networks/Node versions

const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("Database connected");
  } catch (error) {
    console.log("Database connection failed", error);
    process.exit(1); // fail fast — don't let the server start without a DB
  }
};

module.exports = dbConnect;