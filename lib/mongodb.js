import { MongoClient } from 'mongodb';

// DNS configuration will be handled during connection
let dnsConfigured = false;

const configureDNS = async () => {
  if (!dnsConfigured && typeof window === 'undefined' && typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      const dns = await import('dns');
      dns.setServers(['8.8.8.8', '8.8.4.4']);
      dnsConfigured = true;
    } catch (error) {
      console.log('DNS configuration not available in this environment');
    }
  }
};

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const options = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  family: 4, // Force IPv4
};

let client;
let clientPromise;

// Use a simpler connection approach
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    try {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = (async () => {
        await configureDNS();
        return client.connect();
      })();
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
  clientPromise = global._mongoClientPromise;
} else {
  try {
    client = new MongoClient(uri, options);
    clientPromise = (async () => {
      await configureDNS();
      return client.connect();
    })();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default clientPromise;
