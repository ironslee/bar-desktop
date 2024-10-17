import React, { useEffect, useState } from 'react';
import { Layout, Button, Typography, Flex, message } from 'antd';
import { Tables } from '../../components/Tables';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../app/providers/StoreProvider';
import { Users } from '../../components/Users';
import { Menu } from '../../components/Menu';
import { Order } from '../../components/Order';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainPage = () => {
  const [isTablesOpen, setIsTablesOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const { selectedTable, tableOrders } = useAppSelector(
    (state: RootState) => state.tablesStore,
  );
  const { selectedUser } = useAppSelector(
    (state: RootState) => state.usersStore,
  );

  const tableOrder = tableOrders.find(
    (order) => order.tableId === selectedTable?.id,
  );

  const onChangeTablesModal = () => {
    setIsTablesOpen(!isTablesOpen);
  };

  const onChangeUsersModal = () => {
    setIsUsersOpen(!isUsersOpen);
  };

  return (
    <>
      <Flex>
        <Flex vertical>
          <Flex>
            <Tables
              onChangeModal={onChangeTablesModal}
              isTablesOpen={isTablesOpen}
            />
          </Flex>

          {selectedTable && (
            <Flex>
              <Users
                onChangeModal={onChangeUsersModal}
                isUsersOpen={isUsersOpen}
              />
            </Flex>
          )}

          {selectedTable && selectedUser && (
            <>
              <Typography.Title
                level={4}
              >{`Чек ${tableOrder ? tableOrder.checkNumber : ''} стол ${selectedTable.name}`}</Typography.Title>

              <Flex>
                <Flex>
                  <Order />
                </Flex>
                <Flex>
                  <Menu />
                </Flex>
              </Flex>
            </>
          )}
        </Flex>
      </Flex>
    </>
  );
};

export default MainPage;
