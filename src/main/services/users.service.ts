import { UserItem } from '../../renderer/types/User';
import { connect } from './connectDb';

export const getUsers = () => {
  const db = connect();

  const usersQuery = db.prepare(
    `
      SELECT id, name, number
      FROM users;
    `,
  );

  const users = usersQuery.all();

  db.close();

  return users as UserItem[];
};

export const getUserById = (userId: number): UserItem => {
  const db = connect();
  const usersQuery = db.prepare(
    `
      SELECT id, name, number
      FROM users
      WHERE id = ?;
    `,
  );

  const user = usersQuery.get(userId);

  db.close();

  return user as UserItem;
};

export const updateOpenOrderUser = (userId: number, orderNumber: number) => {
  const db = connect();

  const updateUserQuery = db.prepare(`
    UPDATE orders
    SET created_by = ?
    WHERE number = ? AND status = 'open';
  `);

  updateUserQuery.run(userId, orderNumber);

  db.close();
};
