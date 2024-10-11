import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Card, Typography, Flex } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { RootState } from '../../app/providers/StoreProvider';
import {
  addItemToOrder,
  removeItemFromOrder,
  deleteItemFromOrder,
} from './Order.slice';
import { OrderItem } from '../../types/Order';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { colors } from '../../app/providers/ThemeProvider';
import { Clients } from '../Clients';
import { savePrintedItems, syncTableOrder } from '../Tables';
import { Discount } from '../Discount';
import { KitchenTicket, KitchenTicketItem, PreCheck } from '../../types/Print';

const { Title } = Typography;

const Order = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [kitchenTicket, setKitchenTicket] = useState<KitchenTicket>();
  const [preCheck, setPreCheck] = useState<PreCheck>();
  const { items, totalAmount } = useAppSelector(
    (state: RootState) => state.orderStore,
  );
  const { discount } = useAppSelector(
    (state: RootState) => state.discountStore,
  );
  const tableId = useAppSelector(
    (state) => state.tablesStore.selectedTable?.id,
  );
  const orderClient = useAppSelector(
    (state) => state.clientsStore.selectedClient,
  );
  const orderUser = useAppSelector((state) => state.usersStore.selectedUser);

  // const selectedTable = useAppSelector((state) =>
  //   state.tablesStore.tableOrders.find((order) => order.tableId === tableId),
  // );
  const selectedTable = useAppSelector(
    (state) => state.tablesStore.selectedTable,
  );

  const orderItems = useAppSelector((state) => state.orderStore.items);
  // const tableOrderItems = useAppSelector((state) => state.tablesStore.selectedTable)
  const tableOrderItems = useAppSelector((state: RootState) => {
    const tableOrder = state.tablesStore.tableOrders.find(
      (order) => order.tableId === tableId,
    );
    return tableOrder ? tableOrder.orderItems : [];
  });

  const tableOrder = useAppSelector((state) =>
    state.tablesStore.tableOrders.find((order) => order.tableId === tableId),
  );

  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const onChangeDiscountModal = () => {
    setIsDiscountOpen(!isDiscountOpen);
  };

  const onChangeModal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    console.log('items from OrderStore', items);
  }, [items]);

  useEffect(() => {
    if (tableId) {
      dispatch(
        syncTableOrder({
          tableId,
          orderItems,
          orderClient: orderClient || undefined,
          orderDiscount: discount,
          orderUser: orderUser || undefined,
        }),
      );
    }
  }, [tableId, orderItems, dispatch, discount, orderClient, orderUser]);

  useEffect(() => {
    if (
      tableId &&
      tableOrder?.checkNumber &&
      selectedTable &&
      tableOrderItems
    ) {
      setPreCheck({
        checkId: tableOrder.checkNumber,
        table: selectedTable.name,
        user: tableOrder.orderUser?.name || '',
        client: tableOrder.orderClient?.name || '',
        totalAmount,
        discount,
        items: tableOrderItems,
      });
    }
  }, [tableOrder]);

  useEffect(() => {
    if (tableOrderItems && selectedTable) {
      // Фильтруем элементы с quantity > 0
      const kitchenTicketItems: KitchenTicketItem[] = tableOrderItems
        .filter((item) => item.quantity - item.printedQuantity > 0)
        .map((item) => ({
          name: item.product.name,
          quantity: item.quantity - item.printedQuantity,
        }));

      // Обновляем kitchenTicket с учетом новых элементов
      setKitchenTicket({
        items: kitchenTicketItems,
        table: selectedTable.name,
      });
    }

    console.log('kitchenTicket: ', kitchenTicket);
  }, [items, tableOrderItems]);

  const handleAdd = (productId: number) => {
    const product = items.find(
      (item: OrderItem) => item.product.id === productId,
    )?.product;
    if (product) {
      dispatch(addItemToOrder(product));
    }
  };

  const handleRemove = (productId: number) => {
    dispatch(removeItemFromOrder(productId));
  };

  const handleDelete = (productId: number) => {
    dispatch(deleteItemFromOrder(productId));
  };

  // const discountedTotal =
  //   discount > 0 ? totalAmount - (totalAmount / 100) * discount : totalAmount;

  const handlePrintPreCheck = async () => {
    try {
      if (preCheck) {
        await window.electron.printCheck(preCheck);
      }

      console.log(preCheck);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrintKitchenTicket = async () => {
    if (tableId && tableOrderItems) {
      const itemsToPrint = tableOrderItems
        .filter((item) => item.quantity > item.printedQuantity) // Только те, которые еще не отправлены
        .map((item) => ({
          ...item,
          printedQuantity: item.quantity - item.printedQuantity, // Отправляем только оставшиеся
        }));

      console.log('SEND TO PRINT: ', itemsToPrint);
      dispatch(savePrintedItems({ tableId, printedItems: itemsToPrint }));
      try {
        if (kitchenTicket && kitchenTicket.items.length > 0) {
          await window.electron.printKitchenTicket(kitchenTicket);
          setKitchenTicket((prevState) => ({
            ...prevState,
            items: [],
            table: '',
          }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <Card style={{ padding: '20px' }}>
        {items.map((item: OrderItem) => (
          <Flex
            key={item.product.id}
            style={{
              marginBottom: '10px',
              border: '1px solid #D3D3D3',
              borderRadius: '10px',
              padding: '15px',
            }}
          >
            <Row
              justify="space-between"
              align="middle"
              gutter={5}
              style={{ minWidth: '400px' }}
            >
              <Col span={8}>{item.product.name}</Col>
              <Col span={6}>
                <Flex align="center">
                  <Button
                    type="text"
                    onClick={() => handleRemove(item.product.id)}
                    icon={<MinusOutlined style={{ color: colors.primary }} />}
                    style={{ borderRadius: '30px' }}
                  />
                  <Typography.Text>{item.quantity}</Typography.Text>
                  <Button
                    type="text"
                    onClick={() => handleAdd(item.product.id)}
                    icon={<PlusOutlined style={{ color: colors.primary }} />}
                    style={{ borderRadius: '30px' }}
                  />
                </Flex>
              </Col>
              <Col span={4}>{item.product.retprice}</Col>
              <Col span={4}>{item.totalPrice}</Col>
              <Col span={2}>
                <Button
                  type="text"
                  danger
                  onClick={() => handleDelete(item.product.id)}
                  icon={
                    <DeleteOutlined style={{ color: 'var(--error-color)' }} />
                  }
                  style={{ borderRadius: '30px' }}
                />
              </Col>
            </Row>
          </Flex>
        ))}

        <Row justify="center" style={{ marginTop: '20px' }}>
          <Clients onChangeModal={onChangeModal} isOpen={isOpen} />
        </Row>

        <Row justify="end" style={{ marginTop: '20px' }}>
          <Col>
            <Title
              level={5}
            >{`К оплате: ${discount > 0 ? totalAmount - (totalAmount / 100) * discount : totalAmount} тенге`}</Title>
          </Col>
        </Row>
        <Row>
          <Discount
            onChangeModal={onChangeDiscountModal}
            isOpen={isDiscountOpen}
          />
        </Row>
        <Row>
          <Button onClick={handlePrintKitchenTicket} type="primary">
            Бегунок
          </Button>
        </Row>
        <Row justify="space-between" style={{ marginTop: '20px' }}>
          <Button onClick={handlePrintPreCheck} type="default">
            Пред печать
          </Button>
          <Button type="primary">Оплатить</Button>
        </Row>
      </Card>
    </>
  );
};

export default Order;
