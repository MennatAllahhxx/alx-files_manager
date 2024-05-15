import fs from 'fs';
import dbClient from '../utils/db';
import { v4 } from 'uuid';
import UsersController from './UsersController';
import { promisify } from 'util';
import { join as joinPath } from 'path';
import { tmpdir } from 'os';

const mkDirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);
const ROOT_FOLDER_ID = 0;
const DEFAULT_ROOT_FOLDER = 'files_manager';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    const user = 
      token ? await dbClient.getUserFromToken(token) : null;

    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    // check if file exists
    const name = req.body.name;
    const type = req.body.type;
    const parentId = req.body && req.body.parentId ? req.body.parentId : ROOT_FOLDER_ID;
    const isPublic = req.body.isPublic ? req.body.isPublic : false;
    const data = req.body.data;
    const base64Data = req.body && req.body.data ? req.body.data : '';
  

    if (!name) {
      return res.status(400).send({ error: 'Missing name' });
    }
    if (!type) {
      return res.status(400).send({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).send({ error: 'Missing data' });
    }
    if (parentId !== ROOT_FOLDER_ID && parentId !== ROOT_FOLDER_ID.toString()) {
      const file = await dbClient.getById('files', parentId);
      if (!file) {
        return res.status(400).send({ error: 'Parent not found' });
      }

      if (file.type !== 'folder') {
        return res.status(400).send({ error: 'Parent is not a folder' });
      }
    }

    const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0
      ? process.env.FOLDER_PATH.trim()
      : joinPath(tmpdir(), DEFAULT_ROOT_FOLDER);

    const userId = await dbClient.getObjectID(user.id);
    const file = {
      userId,
      name,
      type,
      isPublic,
      parentId:
        parentId === ROOT_FOLDER_ID || parentId === ROOT_FOLDER_ID.toString()
          ? '0'
          : dbClient.getObjectID(parentId),
    };

    await mkDirAsync(baseDir, { recursive: true });

    // CASE 2 : file is not a folder
    if (type !== 'folder') {
      const filePath = joinPath(baseDir, v4());
      await writeFileAsync(filePath, Buffer.from(base64Data, 'base64'));
      file.localPath = filePath;
      console.log('not a folder');
    }

    const result = await dbClient.addObject('files', file);
    file.id = result.insertedId;
    console.log(file);
    res.status(201).json({
      id: file.id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    })
  }
}

export default FilesController;
