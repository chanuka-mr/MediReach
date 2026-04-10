/**
 * Integration Test Setup
 * Configures MongoDB memory server for integration tests
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Set test environment before loading app
process.env.NODE_ENV = 'test';

let mongoServer;

/**
 * Find an available port starting from basePort
 */
const findAvailablePort = async (basePort = 27017) => {
  const net = require('net');
  
  for (let port = basePort; port < basePort + 100; port++) {
    try {
      const server = net.createServer();
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.once('listening', resolve);
        server.listen(port, '127.0.0.1');
      });
      server.close();
      return port;
    } catch (err) {
      // Port in use, try next
      continue;
    }
  }
  throw new Error('Could not find available port');
};

/**
 * Start MongoDB memory server
 */
const startDB = async () => {
  try {
    // Try to find an available port and use it explicitly
    const availablePort = await findAvailablePort(27017);
    
    // Create MongoDB memory server with explicit port configuration
    mongoServer = await MongoMemoryServer.create({
      instance: {
        port: availablePort,
        dbName: 'test-medireach',
      },
      binary: {
        downloadDir: process.env.MMS_DOWNLOAD_DIR || './mongodb-binaries',
      },
    });
    
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    
    console.log('✅ Integration test DB connected');
  } catch (error) {
    console.error('❌ Failed to start MongoDB Memory Server:', error.message);
    throw error;
  }
};

/**
 * Stop MongoDB memory server and disconnect mongoose
 */
const stopDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('✅ Integration test DB disconnected');
  } catch (error) {
    console.error('⚠️  Error stopping MongoDB Memory Server:', error.message);
  }
};

/**
 * Clear all database collections
 */
const clearDB = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  
  console.log('🧹 Database cleaned');
};

module.exports = {
  startDB,
  stopDB,
  clearDB,
};
