import './order.scss';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Row,
  Col,
  Card,
  Typography,
  Flex,
  Divider,
  message,
} from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { RootState } from '../../app/providers/StoreProvider';
import {
  addItemToOrder,
  removeItemFromOrder,
  deleteItemFromOrder,
  addItemsFromTableOrder,
  updatePrintedQuantity,
  setOrderId,
} from './Order.slice';
import { OrderItem, OrderStatus } from '../../types/Order';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { colors } from '../../app/providers/ThemeProvider';
import { Clients } from '../Clients';
import { savePrintedItems, syncTableOrder } from '../Tables';
import { Discount } from '../Discount';
import { KitchenTicket, KitchenTicketItem, PreCheck } from '../../types/Print';
import { Payment } from '../Payment';
import { DiscountItem } from '../../types/Discount';
import {
  selectDiscount,
  selectDiscountFromDb,
} from '../Discount/Discount.slice';
import { calculateStockLeft } from '../../utils/calculateStockLeft';
import { CurrentCount } from '../../types/Product';

const { Title } = Typography;

const Order = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [kitchenTicket, setKitchenTicket] = useState<KitchenTicket>();
  const [preCheck, setPreCheck] = useState<PreCheck>();

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const [savedOrderId, setSavedOrderId] = useState<number | null>(null);

  const [currentCounts, setCurrentCounts] = useState<CurrentCount[]>([]);

  const [discountFromDb, setDiscountFromDb] = useState<DiscountItem | null>(
    null,
  );

  const { items, totalAmount } = useAppSelector(
    (state: RootState) => state.orderStore,
  );
  const orderIdFromStore = useAppSelector((state) => state.orderStore.orderId);
  const { tableOrders } = useAppSelector(
    (state: RootState) => state.tablesStore,
  );
  // const { selectedDiscount } = useAppSelector(
  //   (state: RootState) => state.discountStore,
  // );
  const selectedDiscount = useAppSelector(
    (state) => state.discountStore.selectedDiscount,
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
  const categories = useAppSelector(
    (state: RootState) => state.menuStore.categories,
  );
  // const currentCounts = useAppSelector(
  //   (state: RootState) => state.menuStore.currentCounts,
  // );

  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const onChangeDiscountModal = () => {
    setIsDiscountOpen(!isDiscountOpen);
  };

  const onChangeModal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (tableId && orderUser) {
      dispatch(
        syncTableOrder({
          orderId: orderIdFromStore ?? undefined,
          tableId,
          orderItems,
          orderClient: orderClient || null,
          orderDiscount: selectedDiscount || null,
          orderUser,
        }),
      );
    }
  }, [tableId, orderItems, dispatch, selectedDiscount, orderClient, orderUser]);

  // useEffect(() => {
  //   const fetchDiscount = async () => {
  //     try {
  //       if (tableOrder?.checkNumber) {
  //         const discountData = await window.electron.getDiscountByOrderId(
  //           tableOrder.checkNumber,
  //         );
  //         setDiscountFromDb(discountData);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   if (tableOrder?.checkNumber) {
  //     fetchDiscount();
  //     console.log('discount From DB: ', discountFromDb);
  //     if (discountFromDb?.id) {
  //       dispatch(selectDiscountFromDb(discountFromDb));
  //       console.log('selectedDIsc: ', selectedDiscount);
  //     }
  //   }
  // }, [tableId, orderItems, dispatch, selectedDiscount, orderClient, orderUser]);

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
        user: tableOrder.orderUser?.username || '',
        client: tableOrder.orderClient?.name || '',
        total_amount: totalAmount,
        discount: selectedDiscount?.discount_value ?? 0,
        items: tableOrderItems,
      });
    }
  }, [tableOrder]);

  useEffect(() => {
    if (tableOrderItems && selectedTable) {
      // Фильтруем элементы с quantity > 0
      const kitchenTicketItems: KitchenTicketItem[] = tableOrderItems
        .filter((item) => item.quantity - item.printedQuantity > 0)
        .map((item) => {
          const category = categories.find(
            (cat) => cat.id === item.product.category_id,
          );
          return {
            name: item.product.name,
            quantity: item.quantity - item.printedQuantity,
            print_category: category ? category.print_cat : '',
          };
        });

      // Обновляем kitchenTicket с учетом новых элементов
      setKitchenTicket({
        items: kitchenTicketItems,
        table: selectedTable.name,
      });
    }
  }, [items, tableOrderItems]);

  useEffect(() => {
    const fetchCurrentCounts = async () => {
      try {
        // Вызов асинхронной функции через IPC
        const counts = await window.electron.getCurrentCounts();
        console.log('counts', counts);
        setCurrentCounts(counts); // Устанавливаем состояние с массивом
        // dispatch(setCurrentCounts(counts));
      } catch (error) {
        console.error('Ошибка при получении currentCounts:', error);
      }
    };

    fetchCurrentCounts(); // Вызываем функцию
  }, [tableOrderItems]);

  const handleAdd = async (productId: number) => {
    const product = items.find(
      (item: OrderItem) => item.product.id === productId,
    )?.product;
    if (product) {
      if (product.stock !== null && tableId) {
        const success = window.electron.addProductToCurrentCount(
          product.id,
          tableId,
        );
        if (await success) {
          dispatch(addItemToOrder(product));
        } else {
          message.error('Ошибка добавления продукта в заказ.');
        }
      } else {
        dispatch(addItemToOrder(product));
      }
      // dispatch(addItemToOrder(product));
    }
  };

  const handleRemove = (productId: number) => {
    dispatch(removeItemFromOrder(productId));
  };

  const handleDelete = (productId: number) => {
    dispatch(deleteItemFromOrder(productId));
  };

  const onChangePaymentModal = () => {
    setIsPaymentOpen(!isPaymentOpen);
  };

  // const discountedTotal =
  //   discount > 0 ? total_amount - (total_amount / 100) * discount : total_amount;

  const handlePrintPreCheck = async () => {
    try {
      if (preCheck) {
        await window.electron.printCheck(preCheck);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onUpdatePrintedQuantity = (
    productId: number,
    printedQuantity: number,
  ) => {
    dispatch(updatePrintedQuantity({ productId, printedQuantity }));
  };

  const handlePrintKitchenTicket = async () => {
    if (tableId && tableOrderItems) {
      const itemsToPrint = tableOrderItems
        .filter((item) => item.quantity > item.printedQuantity) // не отправленные
        .map((item) => ({
          ...item,
          printedQuantity: item.quantity - item.printedQuantity, // только оставшиеся
          product_id: item.product.id,
          price: item.product.retprice,
        }));
      console.log('items1', items);

      dispatch(savePrintedItems({ tableId, printedItems: itemsToPrint }));
      try {
        if (kitchenTicket && kitchenTicket.items.length > 0) {
          const newOrder = {
            number: tableOrder?.checkNumber ?? undefined, // Номер чека
            created_at: new Date().toISOString(), // Дата создания
            total_amount: totalAmount, // Общая сумма заказа
            discount_id: selectedDiscount?.id || null, // скдика
            discount_total_amount: selectedDiscount
              ? totalAmount -
                (totalAmount / 100) * selectedDiscount.discount_value
              : totalAmount, // Сумма после скидки
            payment_type_id: null, // Тип оплаты
            table_id: tableId, // ID стола
            client: orderClient?.id || null, // Имя клиента
            created_by: orderUser?.id || null, // Имя пользователя, кто создал заказ
            status: OrderStatus.OPEN, // Статус заказа
            items: itemsToPrint, // Позиции заказа
          };

          // Сохраняем заказ в базе данных
          const orderId = await window.electron.saveOrder(newOrder);

          setSavedOrderId(orderId);
          dispatch(setOrderId(orderId));

          // Сохранение orderId в current_count
          itemsToPrint.map(async (product) => {
            if (product.product.stock !== null) {
              await window.electron.updateOrderIdInCurrentCount(
                tableId,
                orderId,
              );
              console.log('stock', product, orderId);
            }
            console.log('countMapping finished');
          });

          if (orderUser) {
            dispatch(
              syncTableOrder({
                orderId,
                tableId,
                orderItems,
                orderClient: orderClient || null,
                orderDiscount: selectedDiscount || null,
                orderUser,
                checkNumber: orderId,
              }),
            );
          }

          await window.electron.printKitchenTicket(kitchenTicket);
          setKitchenTicket((prevState) => ({
            ...prevState,
            items: [],
            table: '',
          }));
          if (tableOrder) {
            dispatch(addItemsFromTableOrder(tableOrder.orderItems ?? []));
          }
          console.log('items2', items);
        }
      } catch (error) {
        console.log(error);
      }
      itemsToPrint.forEach((item) => {
        onUpdatePrintedQuantity(item.product.id, item.quantity);
      });
    }
  };

  return (
    <>
      <Card style={{ padding: '0px', alignItems: 'start' }}>
        <Row className="order_row items_row">
          {items.map((item: OrderItem) => {
            const stockLeft = calculateStockLeft(item.product, currentCounts);
            console.log('orderStockLeft', stockLeft);
            return (
              <Flex
                key={item.product.id}
                style={{
                  marginBottom: '4px',
                  border: '1px solid #D3D3D3',
                  borderRadius: '10px',
                  padding: '8px 8px',
                  width: '100%',
                  height: '100%',
                }}
              >
                <Row
                  justify="space-between"
                  align="middle"
                  gutter={10}
                  style={{ width: '96%', lineHeight: '1.3' }}
                >
                  <Col span={8} style={{ fontSize: '14px' }}>
                    {item.product.name}
                  </Col>
                  <Col span={6}>
                    <Flex align="center" justify="center">
                      <Button
                        type="text"
                        onClick={() => handleRemove(item.product.id)}
                        icon={<MinusOutlined />}
                        style={{ borderRadius: '30px' }}
                        disabled={item.quantity <= item.printedQuantity}
                        className="minus-button"
                      />

                      <Typography.Text
                        style={{ minWidth: '20px', textAlign: 'center' }}
                      >
                        {item.quantity}
                      </Typography.Text>
                      <Button
                        type="text"
                        onClick={() => handleAdd(item.product.id)}
                        icon={
                          <PlusOutlined style={{ color: colors.primary }} />
                        }
                        style={{ borderRadius: '30px' }}
                        disabled={
                          item.product.stock - stockLeft === item.product.stock
                        }
                        className="plus-button"
                      />
                    </Flex>
                  </Col>
                  <Col span={4}>{item.product.retprice}</Col>
                  <Col span={4}>{item.totalPrice}</Col>
                  <Col span={1}>
                    <Button
                      type="text"
                      danger
                      onClick={() => handleDelete(item.product.id)}
                      icon={<DeleteOutlined />}
                      style={{ borderRadius: '30px' }}
                      disabled={item.printedQuantity > 0}
                      className="delete-button"
                    />
                  </Col>
                </Row>
              </Flex>
            );
          })}
        </Row>
        <Divider />
        <Row className="order_row">
          <Col>
            {' '}
            <Clients onChangeModal={onChangeModal} isOpen={isOpen} />
          </Col>
          <Col>
            <Discount
              onChangeModal={onChangeDiscountModal}
              isOpen={isDiscountOpen}
            />
          </Col>
        </Row>

        <Row className="order_row">
          <Col>
            {' '}
            <Title level={4} style={{ marginBottom: '0' }}>
              К оплате:
            </Title>
          </Col>
          <Col>
            <Title
              level={4}
              style={{ marginBottom: '0' }}
            >{`${selectedDiscount !== null && selectedDiscount !== undefined ? totalAmount - (totalAmount / 100) * selectedDiscount.discount_value : totalAmount} тенге`}</Title>
          </Col>
        </Row>

        <Row className="order_row">
          <Button
            onClick={handlePrintKitchenTicket}
            type="primary"
            style={{ width: '100%', fontSize: '18px' }}
          >
            Бегунок
          </Button>
        </Row>
        <Row className="order_row">
          <Button
            onClick={handlePrintPreCheck}
            type="default"
            style={{ fontSize: '18px' }}
          >
            Пред печать
          </Button>
          <Payment
            isPaymentOpen={isPaymentOpen}
            onChangeModal={onChangePaymentModal}
          />
        </Row>
      </Card>
    </>
  );
};

export default Order;
