import React, { useEffect, useState } from 'react';
import { Layout, Button, Typography, Flex, message } from 'antd';
import { syncTableOrder, Tables } from '../../components/Tables';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../app/providers/StoreProvider';
import { Users } from '../../components/Users';
import { Menu } from '../../components/Menu';
import { Order } from '../../components/Order';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { OrderDbItemWithOrderItems, OrderItem } from '../../types/Order';
import { ProductItem } from '../../types/Product';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainPage = () => {
  const [isTablesOpen, setIsTablesOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  const dispatch = useAppDispatch();
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

  useEffect(() => {
    const fetchOpenOrders = async () => {
      try {
        const openOrders = await window.electron.getOpenOrders(); // Получаем открытые заказы через ipcRenderer
        console.log('openOrderss: ', openOrders);
        if (openOrders && openOrders.length > 0) {
          // Маппим заказы и создаем массив промисов
          const orderPromises = openOrders.map(
            async (order: OrderDbItemWithOrderItems) => {
              const [orderClient, orderUser] = await Promise.all([
                order.client
                  ? window.electron.getClientById(order.client)
                  : Promise.resolve(undefined),
                order.created_by
                  ? window.electron.getUserById(order.created_by)
                  : Promise.resolve(undefined),
              ]);
              const orderItems: OrderItem[] = await Promise.all(
                order.items.map(async (item) => {
                  // Получаем информацию о продукте по productId
                  const product: ProductItem =
                    await window.electron.getProductById(item.productId);

                  // Преобразуем dbItem в OrderItem
                  return {
                    product, // Информация о продукте
                    quantity: item.quantity,
                    totalPrice: item.price, // Используем цену из базы данных
                    printedQuantity: item.quantity, // Значение по умолчанию, если нет данных
                  };
                }),
              );
              console.log(': ', orderClient, orderUser, orderItems);

              // Диспатчим каждый заказ
              dispatch(
                syncTableOrder({
                  tableId: order.table_id,
                  orderItems,
                  orderClient, // Клиент заказа, если был найден
                  orderDiscount: order.discountId, // Скидка
                  orderUser, // Пользователь заказа, если был найден
                  checkNumber: order.number,
                }),
              );
              console.log('tableOrder after sync: ', tableOrders);
            },
          );

          // Ждем завершения всех промисов
          await Promise.all(orderPromises);
        }
        console.log('tableOrder after sync2: ', tableOrders);

        // const openOrders = await window.electron.getOpenOrders(); // Вызов ipcRenderer метода
        // console.log('openOrderss: ', openOrders);
        // if (openOrders.length > 0) {
        //   dispatch(syncTableOrder(openOrders)); // Синхронизация данных
        // }
        // if (openOrders && openOrders.length > 0) {
        //   openOrders.forEach((order: any) => {
        //     // Диспатчим каждый открытый заказ через syncTableOrder
        //     dispatch(
        //       syncTableOrder({
        //         tableId: order.tableId,
        //         orderItems: order.orderItems, // Товары заказа
        //         orderClient: order.orderClient, // Клиент заказа
        //         orderDiscount: order.orderDiscount, // Скидка
        //         orderUser: order.orderUser, // Пользователь
        //       }),
        //     );
        //   });
        // }
      } catch (error) {
        console.error('Ошибка при получении открытых заказов:', error);
        message.error('Ошибка при получении открытых заказов');
      }
    };
    console.log('openOrders');
    fetchOpenOrders(); // Вызываем при монтировании компонента
  }, [dispatch]);

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
