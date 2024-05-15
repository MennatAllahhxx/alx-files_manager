import { v4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization');
    if (!authHeader)
      return res.status(401).send({ error: 'Unauthorized' });

    if (!authHeader.startsWith('Basic '))
      return res.status(401).send({ error: 'Unauthorized' });

    const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
    const [email, password] = credentials.split(':');
    console.log(email, password);
    if (!email || !password)
      return res.status(401).send({ error: 'Unauthorized' });

    const user = await (
      await dbClient.usersCollection()
    ).findOne({
      email: email,
      password: sha1(password),
    });
    console.log('btats');
    console.log('user', user);

    if (!user)
      return res.status(401).send({ error: 'Unauthorized' });

    console.log('user is here')
    const token = v4();
    const key = `auth_${token}`;

    console.log('key', key);
    await redisClient.set(key, user._id.toString(), 24 * 3600);
    
    return res.status(200).send({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    if (!token)
      return res.status(401).send({ error: 'Unauthorized' });

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId)
      return res.status(401).send({ error: 'Unauthorized' });

    await redisClient.del(key);
    return res.status(204).send();
  }
}

export default AuthController;
