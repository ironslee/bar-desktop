import React, { useEffect, useState } from 'react';
import { Layout, Button, Typography, Flex, message, Col, Row } from 'antd';
import { syncTableOrder, Tables } from '../../components/Tables';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../app/providers/StoreProvider';
import { Users } from '../../components/Users';
import { Menu } from '../../components/Menu';
import { Order } from '../../components/Order';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { OrderDbItemWithOrderItems, OrderItem } from '../../types/Order';
import { ProductItem } from '../../types/Product';
import { SignIn } from '../../components/SignIn';

const MainPage = () => {
  const [isTablesOpen, setIsTablesOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  const dispatch = useAppDispatch();
  const tokens = useAppSelector((state) => state.uploadStore.tokens);

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
                  order.discount_id
                    ? window.electron.getDiscountById(order.discount_id)
                    : Promise.resolve(undefined),
                ],
              );

              const orderItems: OrderItem[] = await Promise.all(
                order.items.map(async (item) => {
                  const product: ProductItem =
                    await window.electron.getProductById(item.product_id);

                  return {
                    product,
                    quantity: item.quantity,
                    totalPrice: item.price * item.quantity,
                    printedQuantity: item.quantity,
                  };
                }),
              );

              // Dispatch every order
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

          await Promise.all(orderPromises);
        }
      } catch (error) {
        message.error('Ошибка при получении открытых заказов');
      }
    };
    fetchOpenOrders();
  }, [dispatch]);

  // if (!tokens.token) {
  //   return <SignIn />;
  // }

  return (
    // <>
    //   <Flex>
    //     <Flex vertical style={{ width: '100%' }}>
    //       <Flex
    //         justify="space-between"
    //         style={{ width: '37.5%', marginBottom: '10px' }}
    //       >
    //         <Flex style={{ marginRight: '20px' }}>
    //           <Tables
    //             onChangeModal={onChangeTablesModal}
    //             isTablesOpen={isTablesOpen}
    //           />
    //         </Flex>

    //         {selectedTable && (
    //           <Flex>
    //             <Users
    //               onChangeModal={onChangeUsersModal}
    //               isUsersOpen={isUsersOpen}
    //             />
    //           </Flex>
    //         )}
    //       </Flex>

    //       {selectedTable && selectedUser && (
    //         <>
    //           <Row gutter={5}>
    //             <Col span={9}>
    //               <Row style={{ justifyContent: 'space-between' }}>
    //                 <Col>
    //                   <Typography.Title level={4} className="order_title">
    //                     {`Стол ${selectedTable.name}`}
    //                   </Typography.Title>
    //                 </Col>
    //                 <Col>
    //                   <Typography.Title level={4} className="order_title">
    //                     {tableOrder?.checkNumber
    //                       ? `Чек  ${tableOrder?.checkNumber}`
    //                       : `Заказ не сохранен`}
    //                   </Typography.Title>
    //                 </Col>
    //               </Row>
    //             </Col>
    //           </Row>
    //           <Row gutter={5}>
    //             <Col span={9}>
    //               <Order />
    //             </Col>
    //             <Col span={15}>
    //               <Menu />
    //             </Col>
    //           </Row>
    //         </>
    //       )}
    //     </Flex>
    //   </Flex>
    // </>
    <>
      <Row justify="space-between" align="top">
        <Col span={9}>
          {selectedTable && selectedUser && (
            <Row justify="space-between">
              <Col>
                <Typography.Title level={4} className="order_title">
                  {`Стол ${selectedTable.name}`}
                </Typography.Title>
              </Col>
              <Col>
                <Typography.Title level={4} className="order_title">
                  {tableOrder?.checkNumber
                    ? `Чек ${tableOrder.checkNumber}`
                    : `Заказ не сохранен`}
                </Typography.Title>
              </Col>
            </Row>
          )}
        </Col>

        <Col flex="none" span={15} style={{ display: 'flex', gap: '20px' }}>
          <Tables
            onChangeModal={onChangeTablesModal}
            isTablesOpen={isTablesOpen}
          />
          {selectedTable && (
            <Users
              onChangeModal={onChangeUsersModal}
              isUsersOpen={isUsersOpen}
            />
          )}
        </Col>
      </Row>

      {selectedTable && selectedUser && (
        <>
          <Row gutter={5}>
            <Col span={9}>
              <Order />
            </Col>
            <Col span={15}>
              <Menu />
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default MainPage;
