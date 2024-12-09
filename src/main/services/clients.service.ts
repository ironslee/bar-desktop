import axios from 'axios';
import { ClientItem } from '../../renderer/types/Client';
import { connect } from './connectDb';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { apiUrl } from './main-constants';

export const getClients = () => {
  const db = connect();

  const clientsQuery = db.prepare(
    `
      SELECT id, name, number
      FROM clients;
    `,
  );

  const clients = clientsQuery.all();

  db.close();

  return clients as ClientItem[];
};

export const getClientById = (clientId: number): ClientItem => {
  const db = connect();
  const clientsQuery = db.prepare(
    `
      SELECT id, name, number
      FROM clients
      WHERE id = ?;
    `,
  );

  const client = clientsQuery.get(clientId);

  db.close();

  return client as ClientItem;
};

export const updateOpenOrderClient = (
  clientId: number,
  orderNumber: number,
) => {
  const db = connect();

  const updateClientQuery = db.prepare(`
    UPDATE orders
    SET client = ?
    WHERE number = ? AND status = 'open';
  `);

  updateClientQuery.run(clientId, orderNumber);

  db.close();
};

export const importClients = async () => {
  try {
    const response = await axios.get(`${apiUrl}/desktop/clients`);

    if (!Array.isArray(response.data)) {
      throw new Error('Ответ сервера не содержит массив объектов');
    }

    const clients = await response.data.map((client: ClientItem) => ({
      id: client.id,
      name: client.name,
      number: client.number,
    }));

    // db tables update
    const success = await updateClients(clients);

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

const updateClients = (clients: ClientItem[]) => {
  try {
    const db = connect();

    // Foreign key verification off
    db.prepare('PRAGMA foreign_keys = OFF;').run();

    // Clear clients table
    const clearClients = db.prepare(
      `
        DELETE FROM clients WHERE true;
      `,
    );

    clearClients.run();

    // Insert downloaded clients into clients table
    const insert = db.prepare(`
      INSERT INTO clients (id, name, number)
      VALUES (@id, @name, @number)
    `);

    const insertMany = db.transaction((clients) => {
      for (const client of clients) {
        insert.run(client);
      }
    });

    insertMany(clients);

    // Foreign key verification on
    db.prepare('PRAGMA foreign_keys = ON;').run();

    db.close();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
