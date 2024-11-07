import { ClientItem } from '../../renderer/types/Client';
import { connect } from './connectDb';

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

export const updateOpenOrderClient = (clientId: number, orderNumber: number) => {
  const db = connect();

  const updateClientQuery = db.prepare(`
    UPDATE orders
    SET client = ?
    WHERE number = ? AND status = 'open';
  `);

  updateClientQuery.run(clientId, orderNumber);

  db.close();
};
