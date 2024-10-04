import React, { useEffect, useState } from 'react';
import { Layout, Button, Typography, Flex } from 'antd';
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
            <Typography.Title
              level={4}
            >{`Чек ${tableOrder ? tableOrder.checkNumber : ''} стол ${selectedTable ? selectedTable.name : 'не выбран'}`}</Typography.Title>
          </Flex>
          <Flex>
            <Order />
          </Flex>
        </Flex>
        <Flex vertical align="flex-end">
          <Users onChangeModal={onChangeUsersModal} isUsersOpen={isUsersOpen} />
          <Menu />
        </Flex>
      </Flex>
    </>
  );
};

export default MainPage;
