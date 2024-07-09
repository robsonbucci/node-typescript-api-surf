import { SetupServer } from '@src/server';
import supertest, { SuperTest, Test } from 'supertest';

let server: SetupServer;

beforeAll(async () => {
  server = new SetupServer();
  await server.init();
  global.testRequest = supertest(server.getApp()) as unknown as SuperTest<Test>;
});

afterAll(async () => await server.close());
