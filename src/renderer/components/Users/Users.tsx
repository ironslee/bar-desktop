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

  const handleSelectUser = (id: number) => {
    dispatch(selectUser(id));
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
      <Modal
        title="Пользователи"
        open={isUsersOpen}
        footer={[]}
        onCancel={onChangeModal}
      >
        <Flex
          style={{
            width: '100%',
            minHeight: 'calc(100vh - 48px)',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <Typography>Выберите пользователя</Typography>
          <Row gutter={[16, 16]}>
            {usersState.map((user) => (
              <Col key={user.id} span={6}>
                <Card
                  hoverable
                  onClick={() => handleSelectUser(user.id)}
                  style={{
                    border:
                      selectedUser?.id === user.id
                        ? '2px solid black'
                        : '1px solid gray',
                  }}
                >
                  <Card.Meta title={user.name} />
                </Card>
              </Col>
            ))}
          </Row>
        </Flex>
      </Modal>
    </>
  );
};

export default Users;
