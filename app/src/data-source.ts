import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Feed } from './models/feed';
import { Notification } from './models/notification';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 23306,
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'f2d',
  synchronize: true,
  logging: false,
  entities: [Feed, Notification],
  migrations: [],
  subscribers: [],
});

export { AppDataSource };
