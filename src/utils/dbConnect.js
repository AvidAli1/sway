import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sway"

if (!global._mongooseConnection) {
  global._mongooseConnection = { conn: null, promise: null }
}

async function connectToDatabase() {
  if (global._mongooseConnection.conn) return global._mongooseConnection.conn
  if (!global._mongooseConnection.promise) {
    global._mongooseConnection.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((m) => m)
  }
  global._mongooseConnection.conn = await global._mongooseConnection.promise
  return global._mongooseConnection.conn
}

export default connectToDatabase;