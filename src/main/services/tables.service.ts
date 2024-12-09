import axios from 'axios';
import { TableItem } from '../../renderer/types/Table';
import { connect } from './connectDb';
import { apiUrl } from './main-constants';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { message } from 'antd';

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

export const importTables = async () => {
  try {
    const response = await axios.get(`${apiUrl}/desktop/tables`);

    if (!Array.isArray(response.data)) {
      throw new Error('Ответ сервера не содержит массив объектов');
    }

    const tables = await response.data.map((table: TableItem) => ({
      id: table.id,
      name: table.name,
      color: table.color,
    }));

    // db tables update
    const success = await updateTables(tables);

    if (!success) {
      throw new Error('Ошибка обновления таблиц в базе данных');
    }

    console.log('Таблицы успешно импортированы и обновлены.');
    return true;
  } catch (error) {
    console.error('Ошибка импорта таблиц:', error);
    return false;
  }
};

const updateTables = (tables: TableItem[]) => {
  try {
    const db = connect();

    // Foreign key verification off
    db.prepare('PRAGMA foreign_keys = OFF;').run();

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

    // Foreign key verification on
    db.prepare('PRAGMA foreign_keys = ON;').run();

    db.close();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
