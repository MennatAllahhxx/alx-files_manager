import crypto from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const email = req.body.email || null;
    const password = req.body.password || null;

    if (!req.body) {
      return res.json({ error: 'Missing request body' }).status(400);
    }

    if (!email) {
      return res.json({ error: 'Missing email' }).status(400);
    }

    if (!password) {
      return res.json({ error: 'Missing password' }).status(400);
    }

    const collection = dbClient.client.db().collection('users');

    const user = await collection.findOne({ email });

    if (user) {
      return res.json({ error: 'Already exist' }).status(400);
    }

    const hashedPassword = crypto.createHash('sha1')
      .update(password).digest('hex');

    const userAdded = await collection.insertOne({
      email,
      password: hashedPassword,
    });

    return res.json({ id: userAdded.insertedId, email }).status(201);
  }
}

export default UsersController;
