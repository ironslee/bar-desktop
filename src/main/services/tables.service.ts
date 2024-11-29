import axios from 'axios';
import { TableItem } from '../../renderer/types/Table';
import { connect } from './connectDb';
import { apiUrl } from './main-constants';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';

export const getTables = () => {
  const db = connect();

  const tablesQuery = db.prepare(
    `
      SELECT id, name, color
      FROM tables;
    `,
  );

  const tables = tablesQuery.all();

  db.close();

  return tables as TableItem[];
};

export const importTables = async (token: string) => {
  try {
    const response = await axios.post(
      `${apiUrl}/desktop/tables`,
      {},
      {
        responseType: 'blob',
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    const filePath =
      process?.env?.NODE_ENV === 'development'
        ? app.getAppPath() + '/tables.csv'
        : path.join(process.resourcesPath, '/tables.csv');
    fs.writeFileSync(filePath, response.data);

    const result: any[] = [];

    await fs
      .createReadStream(filePath)
      .pipe(
        csv({
          separator: ',',
          mapHeaders: ({ header }) => {
            return String(header).trim();
          },
        }),
      )
      .on('data', (data) => result.push(data))
      .on('end', () => {
        updateTables(result);
      });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const updateTables = (tables: TableItem[]) => {
  try {
    const db = connect();

    // Clear tables table
    const clearTables = db.prepare(
      `
        DELETE FROM tables WHERE true;
      `,
    );

    clearTables.run();

    // Insert downloaded tables into tables table
    const insert = db.prepare(`
      INSERT INTO tables (id, name, color)
      VALUES (@id, @name, @color)
    `);

    const insertMany = db.transaction((tables) => {
      for (const table of tables) {
        insert.run(table);
      }
    });

    insertMany(tables);

    db.close();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
