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
