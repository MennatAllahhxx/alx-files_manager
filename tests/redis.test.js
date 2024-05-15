/* eslint-disable no-unused-expressions */
/* eslint-disable jest/prefer-expect-assertions */
/* eslint-disable jest/valid-expect */
import { expect } from 'chai';
import redisClient from '../utils/redis';

describe('redisClient', () => {
  it('redis is alive', () => {
    expect(redisClient.isAlive()).to.equal(true);
  });

  it('set keys with values', async () => {
    const key = 'key';
    const value = 'value';
    await redisClient.set(key, value, 5);
    const result = await redisClient.get(key);
    expect(result).to.equal(value);
  });

  it('delete key', async () => {
    const key = 'key';
    const val = 'value';
    await redisClient.set(key, val, 8);
    await redisClient.del(key);
    const result = await redisClient.get(key);
    expect(result).to.be.null;
  });
});
