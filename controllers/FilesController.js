/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
import fs from 'fs';
import { v4 } from 'uuid';
import { promisify } from 'util';
import { join as joinPath } from 'path';
import { tmpdir } from 'os';
import UsersController from './UsersController';
import dbClient from '../utils/db';

const mkDirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);
const ROOT_FOLDER_ID = 0;
const DEFAULT_ROOT_FOLDER = 'files_manager';

const validTypes = {
  folder: 'folder',
  file: 'file',
  image: 'image',
};

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    const user = token ? await dbClient.getUserFromToken(token) : null;

    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    // check if file exists
    const { name } = req.body;
    const { type } = req.body;
    const parentId = req.body && req.body.parentId ? req.body.parentId : ROOT_FOLDER_ID;
    const isPublic = req.body.isPublic ? req.body.isPublic : false;
    const { data } = req.body;
    const base64Data = req.body && req.body.data ? req.body.data : '';

    if (!name) {
      return res.status(400).send({ error: 'Missing name' });
    }
    if (!type || !Object.values(validTypes).includes(type)) {
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
      parentId: parentId || 0,
    };
    if (type !== 'folder') {
      file.isPublic = isPublic;
    }

    await mkDirAsync(baseDir, { recursive: true });

    // CASE 2 : file is not a folder
    if (type !== 'folder') {
      const filePath = joinPath(baseDir, v4());
      await writeFileAsync(filePath, Buffer.from(base64Data, 'base64'));
      if (type === 'image') {
        file.localPath = filePath;
      }
    }

    const result = await dbClient.addObject('files', file);
    file.id = result.insertedId;
    res.status(201).json({
      id: file.id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: parentId || 0,
    });
  }

  static async getShow(req, res) {
    // 1- Retrieve the user based on the token
    const token = req.header('X-Token');
    const user = token ? await dbClient.getUserFromToken(token) : null;

    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const fileId = req.params.id;
    const file = await dbClient.getById('files', fileId);

    if (!file) {
      return res.status(404).send({ error: 'Not found' });
    }

    return res.status(200).send({
      id: file.id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getIndex(req, res) {
    // 1- Retrieve the user based on the token
    const token = req.header('X-Token');
    const user = token ? await dbClient.getUserFromToken(token) : null;

    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId ? req.query.parentId : ROOT_FOLDER_ID.toString();
    const pageNumber = req.query.page ? parseInt(req.query.page, 10) : 0;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 20;
    const match = {
      userId: user.id,
      parentId,
    };

    const files = await dbClient.returnPagedFilesList(pageNumber, pageSize, match);
    return res.status(200).send({ files });
  }
}

export default FilesController;
