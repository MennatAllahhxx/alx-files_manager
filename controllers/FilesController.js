import fs from 'fs';
import dbClient from '../utils/db';
import UsersController from './UsersController';


class FilesController {
  static async postUpload(req, res) {
    const user = req.user;
  
    // check if user exists
    const userExists = await dbClient
      .client
      .db('files_manager')
      .collection('users')
      .findOne({ _id: dbClient.getObjectId(user.id) });

    if (!userExists) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // check if file exists
    const name = req.body.name;
    const type = req.body.type;
    const parentId = req.body && req.body.parentId ? req.body.parentId : ROOT_FOLDER_ID;
  
    if (!name) {
      return res.status(400).send({ error: 'Missing name' });
    }
    if (!type) {
      return res.status(400).send({ error: 'Missing type' });
    }
    if (!parentId || parentId !== ROOT_FOLDER_ID) {
      const file = await (await dbClient.collection()
      ).findOne({ _id: dbClient.getObjectId(parentId) });

      return res.status(400).send({ error: 'Parent not found' });
    }

  }
}
