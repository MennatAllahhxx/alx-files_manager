/* eslint-disable jest/prefer-expect-assertions */
/* eslint-disable jest/valid-expect */
import { expect } from 'chai';
import { mongodb } from 'mongodb';
import dbClient from '../utils/db';

describe('dbClient', () => {
  it('db is alive', () => {
    expect(dbClient.isAlive()).to.equal(true);
  });

  it('check number of users', async () => {
    const usersCount = await dbClient.nbUsers();
    expect(usersCount).to.equal(1);
  });

  it('check number of files', async () => {
    const filesCount = await dbClient.nbFiles();
    expect(filesCount).to.equal(30);
  });

  it('users collection', async () => {
    const usersCollection = await dbClient.usersCollection();
    expect(usersCollection).to.be.an('object');
  });

  it('files collection', async () => {
    const filesCollection = await dbClient.filesCollection();
    expect(filesCollection).to.be.an('object');
  });

  it('get by id', async () => {
    const id = '123';
    const collection = 'users';
    const expected = { _id: id, name: 'test' };

    dbClient.getById.mockResolvedValue(expected);

    const actual = await dbClient.getById(collection, id);

    expect(actual).toStrictEqual(expected);
    expect(dbClient.getById).toHaveBeenCalledWith(collection, new mongodb.ObjectID(id));
  });

  it('get object id', async () => {
    const id = '123';
    const expected = new mongodb.ObjectID(id);
    const actual = await dbClient.getObjectID(id);
    expect(actual).toStrictEqual(expected);
  });

  it('add object', async () => {
    const collection = 'users';
    const object = { name: 'test' };

    dbClient.addObject.mockResolvedValue({ insertedId: '123' });

    const actual = await dbClient.addObject(collection, object);

    expect(actual).toHaveProperty('insertedId');
    expect(dbClient.addObject).toHaveBeenCalledWith(collection, object);
  });

  it('get user from token', async () => {
    const token = 'auth_token';
    const userId = '123'; // Example user ID
    const expected = { _id: userId, username: 'user1' };

    dbClient.getUserFromToken.mockResolvedValue(expected);

    const actual = await dbClient.getUserFromToken(token);

    expect(actual).toStrictEqual(expected);
    expect(dbClient.getById).toHaveBeenCalledWith('users', userId);
  });
});
