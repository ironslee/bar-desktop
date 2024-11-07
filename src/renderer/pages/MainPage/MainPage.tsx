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
        const openOrders = await window.electron.getOpenOrders();
        console.log('openOrderss: ', openOrders);
        if (openOrders && openOrders.length > 0) {
          // Маппим заказы и создаем массив промисов
          const orderPromises = openOrders.map(
            async (order: OrderDbItemWithOrderItems) => {
              const [orderClient, orderUser, orderDiscount] = await Promise.all(
                [
                  order.client
                    ? window.electron.getClientById(order.client)
                    : Promise.resolve(undefined),
                  order.created_by
                    ? window.electron.getUserById(order.created_by)
                    : Promise.resolve(undefined),
                  order.discountId
                    ? window.electron.getDiscountById(order.discountId)
                    : Promise.resolve(undefined),
                ],
              );
              const orderItems: OrderItem[] = await Promise.all(
                order.items.map(async (item) => {
                  // Получаем информацию о продукте по productId
                  const product: ProductItem =
                    await window.electron.getProductById(item.productId);

                  // Преобразуем dbItem в OrderItem
                  return {
                    product,
                    quantity: item.quantity,
                    totalPrice: item.price * item.quantity,
                    printedQuantity: item.quantity,
                  };
                }),
              );
              console.log(': ', orderClient, orderUser, orderItems);

              // Диспатчим каждый заказ
              dispatch(
                syncTableOrder({
                  tableId: order.table_id,
                  orderItems,
                  orderClient,
                  orderDiscount,
                  orderUser,
                  checkNumber: order.number,
                }),
              );
            },
          );

          // Ждем завершения всех промисов
          await Promise.all(orderPromises);
        }

        // const openOrders = await window.electron.getOpenOrders();
        // console.log('openOrderss: ', openOrders);
        // if (openOrders.length > 0) {
        //   dispatch(syncTableOrder(openOrders));
        // }
        // if (openOrders && openOrders.length > 0) {
        //   openOrders.forEach((order: any) => {
        //     // Диспатчим каждый открытый заказ через syncTableOrder
        //     dispatch(
        //       syncTableOrder({
        //         tableId: order.tableId,
        //         orderItems: order.orderItems,
        //         orderClient: order.orderClient,
        //         orderDiscount: order.orderDiscount,
        //         orderUser: order.orderUser,
        //       }),
        //     );
        //   });
        // }
      } catch (error) {
        message.error('Ошибка при получении открытых заказов');
      }
    };
    console.log('openOrders');
    fetchOpenOrders();
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
              >{`Чек ${tableOrder?.checkNumber ?? ''} стол ${selectedTable.name}`}</Typography.Title>

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
