import { TableItem } from '../../renderer/types/Table';
import { connect } from './connectDb';

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
