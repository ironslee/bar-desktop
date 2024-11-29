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

export const importClients = async (token: string) => {
  try {
    const response = await axios.post(
      `${apiUrl}/desktop/clients`,
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
        ? app.getAppPath() + '/clients.csv'
        : path.join(process.resourcesPath, '/clients.csv');
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
        updateClients(result);
      });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const updateClients = (clients: ClientItem[]) => {
  try {
    const db = connect();

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

    db.close();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
