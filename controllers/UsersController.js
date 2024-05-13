import crypto from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const email = req.body.email || null;
    const password = req.body.password || null;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const collection = await dbClient.client.db().collection('users');

    const user = await collection.findOne({ email });

    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = crypto.createHash('sha1')
      .update(password).digest('hex');

    const userAdded = await collection.insertOne({
      email,
      password: hashedPassword,
    });

    return res.status(201).json({ email, id: userAdded.insertedId });
  }
}

export default UsersController;
