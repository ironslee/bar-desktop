import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

export function connect() {
  return Database(getAssetPath('database.db'), {
    verbose: console.log,
    fileMustExist: true,
  });
}
