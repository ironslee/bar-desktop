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
