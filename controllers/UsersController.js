/* eslint-disable no-unused-vars */
import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

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

  static async getMe(req, res) {
    const token = req.header('X-Token') || null;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const collection = await dbClient.client.db().collection('users');

    const key = `auth_${token}`;

    const userId = await redisClient.get(key);
    console.log(userId);

    if (!userId) { return res.status(401).json({ error: 'Unauthorized' }); }

    const user = await dbClient.getById('users', userId);
    console.log(user);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
