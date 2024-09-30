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
