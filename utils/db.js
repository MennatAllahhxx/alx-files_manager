import mongodb from 'mongodb';
import redisClient from './redis';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.url = `mongodb://${this.host}:${this.port}/${this.database}`;

    this.client = new mongodb.MongoClient(this.url, { useUnifiedTopology: true });
    this.client.on('error', (err) => {
      console.log(err);
    }).connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  async usersCollection() {
    return this.client.db().collection('users');
  }

  async filesCollection() {
    return this.client.db().collection('files');
  }
  async getById(collection, id) {
    const obId = new mongodb.ObjectID(id);
    return this.client.db().collection(collection).findOne({ _id: obId });
  }

  async getObjectID(id) {
    const newId = new mongodb.ObjectID(id);
    return newId;
  }

  async addObject(collection, object) {
    return this.client.db().collection(collection).insertOne(object);
  }

  async getUserFromToken(token) {
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    return this.getById('users', userId);
  }
}


const dbClient = new DBClient();
module.exports = dbClient;
