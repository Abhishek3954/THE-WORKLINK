import { MongoClient, Db } from "mongodb";
import dns from "dns";

// Fix for Node.js DNS resolution issues with MongoDB SRV records
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

const MONGODB_URI = process.env.MONGODB_URI;

let clientPromise: Promise<MongoClient>;

if (MONGODB_URI) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI);
      global._mongoClientPromise = client.connect().catch(err => {
        console.error("Failed to connect to MongoDB in development:", err);
        throw err;
      });
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect().catch(err => {
      console.error("Failed to connect to MongoDB in production:", err);
      throw err;
    });
  }
} else {
  // If MONGODB_URI is not set (e.g. during a build phase or if environment variables are missing),
  // we assign a rejected promise that will throw an error when awaited, but won't crash the server at startup.
  const errorMessage = "MONGODB_URI environment variable is missing. Please set it in your environment variables dashboard.";
  clientPromise = Promise.reject(new Error(errorMessage));
  // Catch the rejection to prevent UnhandledPromiseRejection warning/crash in Node.js
  clientPromise.catch(() => {});
}

/**
 * Helper to get the database instance
 */
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db();
}

export default clientPromise;