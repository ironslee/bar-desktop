import axios from 'axios';
import { UserItem } from '../../renderer/types/User';
import { connect } from './connectDb';
import { apiUrl } from './main-constants';

export const getUsers = () => {
  const db = connect();

  const usersQuery = db.prepare(
    `
      SELECT id, username, email, phone_number, full_name
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
      SELECT id, username, email, phone_number, full_name
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

export const importUsers = async () => {
  try {
    const response = await axios.get(`${apiUrl}/users`);

    if (!Array.isArray(response.data)) {
      throw new Error('Ответ сервера не содержит массив объектов');
    }

    const users = await response.data.map((user: UserItem) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      phone_number: user.phone_number,
      full_name: user.full_name,
    }));

    // db tables update
    const success = await updateUsers(users);

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

const updateUsers = (users: UserItem[]) => {
  try {
    const db = connect();

    // Foreign key verification off
    db.prepare('PRAGMA foreign_keys = OFF;').run();

    // Clear clients table
    const clearClients = db.prepare(
      `
        DELETE FROM users WHERE true;
      `,
    );

    clearClients.run();

    // Insert downloaded clients into clients table
    const insert = db.prepare(`
      INSERT INTO users (id, username, email, phone_number, full_name)
      VALUES (@id, @username, @email, @phone_number, @full_name)
    `);

    const insertMany = db.transaction((users) => {
      for (const user of users) {
        insert.run(user);
      }
    });

    insertMany(users);

    // Foreign key verification on
    db.prepare('PRAGMA foreign_keys = ON;').run();

    db.close();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
