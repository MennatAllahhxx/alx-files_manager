import mongodb from 'mongodb';

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

  async filescollection() {
    return this.client.db().collection('files');
  }
  async getById(collection, id) {
    const obId = new mongodb.ObjectID(id);
    return this.client.db().collection(collection).findOne({ _id: obId });
  }
}


const dbClient = new DBClient();
module.exports = dbClient;
