import './users.scss';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Flex, Modal, Row, Typography, message } from 'antd';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { selectUser, setUsers } from './Users.slice';
import { RootState } from '../../app/providers/StoreProvider';
import { UserItem } from '../../types/User';

interface UsersProps {
  onChangeModal: () => void;
  isUsersOpen: boolean;
}

const Users = ({ onChangeModal, isUsersOpen }: UsersProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { selectedUser } = useAppSelector(
    (state: RootState) => state.usersStore,
  );
  const [usersState, setUsersState] = useState<UserItem[]>([]);
  const { tableOrders, selectedTable } = useAppSelector(
    (state: RootState) => state.tablesStore,
  );
  const tableOrder = tableOrders.find(
    (order) => order.tableId === selectedTable?.id,
  );

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await window.electron.getUsers();
      setUsersState(fetchedUsers);
      dispatch(setUsers(fetchedUsers));
    } catch (error) {
      message.error('Не удалось загрузить пользователей');
    }
  };

  useEffect(() => {
    if (isUsersOpen) {
      fetchUsers();
    }
  }, [isUsersOpen]);

  const handleSelectUser = async (record: UserItem) => {
    dispatch(selectUser(record.id));
    try {
      if (tableOrder?.checkNumber) {
        await window.electron.updateOpenOrderUser(
          record.id,
          tableOrder.checkNumber,
        );
      }
    } catch {
      // Ошибки обрабатываются без вывода сообщений
    }
    onChangeModal();
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => onChangeModal()}
        // style={{ maxWidth: 150 }}
        className={selectedUser ? 'button_small' : 'button_large'}
      >
        {selectedUser ? selectedUser.name : 'Выберите официанта'}
      </Button>
      <Modal open={isUsersOpen} footer={[]} onCancel={onChangeModal}>
        <Typography.Title level={3}>Выберите пользователя</Typography.Title>
        {/* <Flex
          style={{
            width: '100%',
            minHeight: 'calc(100vh - 48px)',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        > */}
        <Row gutter={[10, 10]} align="top">
          {usersState.map((user) => (
            <Col key={user.id} span={8}>
              <Card
                className="card"
                hoverable
                onClick={() => handleSelectUser(user)}
                style={{
                  border:
                    selectedUser?.id === user.id
                      ? '3px solid #16C787'
                      : '1px solid gray',
                  fontWeight: selectedUser?.id === user.id ? '600' : '400',
                }}
              >
                {user.name}
              </Card>
            </Col>
          ))}
        </Row>
        {/* </Flex> */}
      </Modal>
    </>
  );
};

export default Users;
