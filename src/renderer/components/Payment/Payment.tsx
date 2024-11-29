import './payment.scss';
import React, { useState } from 'react';
import {
  Modal,
  Button,
  Radio,
  Typography,
  message,
  Row,
  Col,
  Divider,
  Table,
  Flex,
  Drawer,
  Space,
} from 'antd';
import { useSelector } from 'react-redux'; // Для подключения к Redux
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../app/providers/StoreProvider';
import { useAppSelector } from '../../hooks/useAppSelector';
import {
  CloseOrderData,
  OrderItem,
  OrderItemData,
  OrderStatus,
  SaveOrderData,
} from '../../types/Order';
import { Routes } from '../../app/providers/RouterProvider';
import { Check } from '../Check';
import { PaymentTypeEnum } from '../../types/Payment';

const { Text, Title } = Typography;

interface PaymentProps {
  onChangeModal: () => void;
  isPaymentOpen: boolean;
}

interface ProductTableItem {
  key: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

const Payment = ({
  isPaymentOpen,
  onChangeModal,
}: PaymentProps): JSX.Element => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<
    PaymentTypeEnum.CASH | PaymentTypeEnum.CARD | null
  >(null);

  // Данные из Redux
  const tableId = useAppSelector(
    (state: RootState) => state.tablesStore.selectedTable?.id,
  );
  const tableOrder = useAppSelector((state: RootState) =>
    state.tablesStore.tableOrders.find((order) => order.tableId === tableId),
  );
  const { totalAmount } = useAppSelector(
    (state: RootState) => state.orderStore,
  );
  const discount = tableOrder?.orderDiscount; // Скидка

  const amountToPay =
    totalAmount - (totalAmount / 100) * (discount?.discount_value || 0);
  const paymentMethodValue = paymentMethod === PaymentTypeEnum.CASH ? 0 : 1;

  const handlePaymentMethodChange = (e: any) => {
    setPaymentMethod(e.target.value);
  };

  const tableName = useAppSelector((state: RootState) => {
    const table = state.tablesStore.tables.find(
      (order) => order.id === tableId,
    );
    return table?.name;
  });

  const handlePayment = async () => {
    if (!paymentMethod) {
      message.warning('Выберите способ оплаты');
      return;
    }

    try {
      if (tableOrder && paymentMethod) {
        let orderItemsData: OrderItemData[] = [];

        if (tableOrder?.orderItems) {
          orderItemsData = tableOrder.orderItems.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.retprice,
            total: item.totalPrice,
          }));
        }

        const closeOrderData: SaveOrderData = {
          number: tableOrder?.checkNumber ?? 0,
          created_at: new Date().toISOString(),
          total_amount: totalAmount,
          discount_id: tableOrder?.orderDiscount?.id ?? null,
          discount_total_amount: amountToPay,
          payment_type_id: paymentMethodValue,
          table_id: tableOrder.tableId,
          client: tableOrder.orderClient?.id ?? null,
          created_by: tableOrder.orderUser?.id ?? null,
          status: OrderStatus.CLOSED,
          orderItems: orderItemsData,
        };

        const response = await window.electron.closeOrder(closeOrderData);
        await window.electron.printCheck({
          checkId: tableOrder?.checkNumber ?? 0,
          table: tableName ?? '',
          user: tableOrder.orderUser?.name ?? '',
          client: tableOrder.orderClient?.name ?? '',
          total_amount: totalAmount,
          discount: tableOrder.orderDiscount?.discount_value ?? 0,
          items: tableOrder.orderItems ?? [],
        });

        if (response) {
          await message.success('Оплата успешно завершена!');
          onChangeModal(); // Закрываем окно оплаты
          window.location.href = '/';
        } else {
          message.error('Заказ не сохранен! Оплата невозможна!');
        }
      }

      // navigate(Routes.Home);
    } catch (error) {
      console.error('Ошибка при сохранении заказа:', error);
      message.error('Не удалось сохранить заказ. Попробуйте еще раз.');
    }
  };

  // Данные для таблицы
  const productData =
    tableOrder?.orderItems?.map((item, index) => ({
      key: index + 1,
      name: item.product.name,
      price: item.product.retprice,
      quantity: item.quantity,
      total: item.totalPrice,
    })) || [];

  // Колонки таблицы
  const columns = [
    { title: '№', dataIndex: 'key', key: 'key', align: 'center' },
    { title: 'Наименование', dataIndex: 'name', key: 'name' },
    { title: 'Цена', dataIndex: 'price', key: 'price', align: 'left' },
    { title: 'Кол-во', dataIndex: 'quantity', key: 'quantity', align: 'right' },
    { title: 'Сумма', dataIndex: 'total', key: 'total', align: 'right' },
  ];

  return (
    <>
      <Button
        type="primary"
        onClick={() => onChangeModal()}
        style={{ fontSize: '18px' }}
      >
        Оплатить
      </Button>
      {/* <Modal
        open={isPaymentOpen}
        onCancel={onChangeModal}
        footer={null}
        // width="fit-content"
        width="auto"
        style={{ maxWidth: '60vw' }}
      >
        <Typography.Title level={3}>Оплата</Typography.Title>

        <Divider />

        <Row gutter={16}>
          <Col span={12} style={{ minHeight: '' }}>
            <Flex vertical style={{ height: '100%' }}>
              <Title level={5}>Скидка: {discount?.discount_value ?? 0}%</Title>
              <Title level={5}>Итого: {totalAmount} KZT</Title>
              <Title level={5}>Итого со скидкой: {amountToPay} KZT</Title>
              <Title level={5}>К оплате: {amountToPay} KZT</Title>

              <Divider />

              <Typography.Title level={5}>
                Выберите способ оплаты
              </Typography.Title>
              <Radio.Group
                onChange={handlePaymentMethodChange}
                value={paymentMethod}
                style={{ marginBottom: 16 }}
              >
                <Radio.Button className="radio_button" value="cash">
                  Наличные
                </Radio.Button>
                <Radio.Button className="radio_button" value="card">
                  Карта
                </Radio.Button>
              </Radio.Group>
              <Divider />

              <Flex
                justify="space-between"
                align="stretch"
                style={{ height: '100%' }}
              >
                <Button onClick={onChangeModal}>Отмена</Button>
                <Button type="primary" onClick={handlePayment}>
                  Оплатить
                </Button>
              </Flex>
            </Flex>
          </Col> */}

      {/* Правая часть - чек */}
      {/* <Col span={12}>
            <div
              style={{
                border: '1px solid #d9d9d9',
                padding: '16px',
                width: 'fit-content',
                maxWidth: '100%',
              }}
            >
              <Title level={4} style={{ textAlign: 'center' }}>
                Barista
              </Title>
              <Text>Чек {tableOrder?.checkNumber}</Text>
              <br />
              <Text>Дата: {new Date().toLocaleString()}</Text>
              <br />
              <Text>{`Клиент: ${tableOrder?.orderClient?.name ?? ''}`}</Text>
              <br />
              <Text>{`Контакты клиента: ${tableOrder?.orderClient?.number ?? ''}`}</Text>
              <Divider />
              <table className="tableStyle">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} className="cellStyle">
                        {col.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productData.map((item) => (
                    <tr key={item.key}>
                      <td className="cellStyle">{item.key}</td>
                      <td className="cellStyle">{item.name}</td>
                      <td className="cellStyle">{item.price} тг</td>
                      <td className="cellStyle">{item.quantity}</td>
                      <td className="cellStyle">{item.total} тг</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Divider />
              <Text style={{ fontWeight: 'bold' }}>
                Скидка: {discount?.discount_value ?? 0}%
              </Text>
              <br />
              <Text style={{ fontWeight: 'bold' }}>
                ИТОГО: {totalAmount} тг
              </Text>
              <br />
              <Text style={{ fontWeight: 'bold' }}>
                ИТОГО СО СКИДКОЙ: {amountToPay} тг
              </Text>
            </div>
          </Col> */}
      {/* <Check
            amountToPay={amountToPay}
            discount={discount}
            totalAmount={totalAmount}
            tableOrder={tableOrder}
          />
        </Row>
      </Modal> */}
      {/* ------------------------- */}
      <Drawer
        title="Оплата"
        placement="right"
        size="large"
        width="100%"
        onClose={onChangeModal}
        open={isPaymentOpen}
        extra={
          <Space size="middle">
            <Button onClick={onChangeModal}>Отмена</Button>
            <Button
              type="primary"
              onClick={handlePayment}
              // disabled={discountSum - paymentsSum > 0}
            >
              Оплатить
            </Button>
          </Space>
        }
      >
        <Flex align="flex-start">
          {/* Левая часть - детали оплаты */}
          <Flex
            gap="16px"
            vertical
            style={{ flexBasis: '50%' }}
            className="payment-actions"
          >
            <Flex
              vertical
              style={{
                marginBottom: '32px',
              }}
            >
              <Title level={5}>Скидка: {discount?.discount_value ?? 0}%</Title>
              <Title level={5}>Итого: {totalAmount} KZT</Title>
              <Title level={5}>Итого со скидкой: {amountToPay} KZT</Title>
              <Title level={5}>К оплате: {amountToPay} KZT</Title>

              <Divider />

              {/* Выбор метода оплаты */}
              <Typography.Title level={5}>
                Выберите способ оплаты
              </Typography.Title>
              <Radio.Group
                onChange={handlePaymentMethodChange}
                value={paymentMethod}
                style={{ marginBottom: 16 }}
              >
                <Radio.Button className="radio_button" value="cash">
                  Наличные
                </Radio.Button>
                <Radio.Button className="radio_button" value="card">
                  Карта
                </Radio.Button>
              </Radio.Group>
            </Flex>
            <Divider />

            {/* <Flex
                justify="space-between"
                align="stretch"
                style={{ height: '100%' }}
              >
                <Button onClick={onChangeModal}>Отмена</Button>
                <Button type="primary" onClick={handlePayment}>
                  Оплатить
                </Button>
              </Flex> */}
          </Flex>

          <Check
            amountToPay={amountToPay}
            discount={discount}
            totalAmount={totalAmount}
            tableOrder={tableOrder}
          />
        </Flex>
      </Drawer>
    </>
  );
};

export default Payment;
