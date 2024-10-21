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
} from 'antd';
import { useSelector } from 'react-redux'; // Для подключения к Redux

const { Text, Title } = Typography;

interface PaymentProps {
  onChangeModal: () => void;
  isPaymentOpen: boolean;
}

const Payment: React.FC<PaymentProps> = ({ isPaymentOpen, onChangeModal }) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(
    null,
  );

  // Данные из Redux
  const orderItems = useSelector((state: any) => state.order.orderItems); // Примерное состояние
  const totalAmount = useSelector((state: any) => state.order.totalAmount); // Общая сумма
  const discount = useSelector((state: any) => state.order.discount); // Скидка
  const amountToPay = useSelector((state: any) => state.order.amountToPay); // Сумма к оплате

  const handlePaymentMethodChange = (e: any) => {
    setPaymentMethod(e.target.value);
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      message.warning('Выберите способ оплаты');
      return;
    }

    // Здесь будет отправка данных на сервер позже
    message.success(`Оплата выполнена с использованием: ${paymentMethod}`);
    onChangeModal(); // Закрыть модалку после оплаты
  };

  return (
    <>
      <Button type="primary" onClick={() => onChangeModal()}>
        Оплатить
      </Button>
      <Modal
        title="Оплата"
        open={isPaymentOpen}
        onCancel={onChangeModal}
        footer={null}
      >
        <Row gutter={16}>
          {/* Левая часть - детали оплаты */}
          <Col span={12}>
            <div>
              <Text>Скидка: {discount}%</Text>
              <Title level={5}>Итого: {totalAmount} KZT</Title>
              <Title level={5}>Итого со скидкой: {amountToPay} KZT</Title>
              <Title level={5}>К оплате: {amountToPay} KZT</Title>

              <Divider />

              {/* Выбор метода оплаты */}
              <Radio.Group
                onChange={handlePaymentMethodChange}
                value={paymentMethod}
                style={{ marginBottom: 16 }}
              >
                <Radio.Button value="cash">Наличные</Radio.Button>
                <Radio.Button value="card">Карта</Radio.Button>
              </Radio.Group>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button onClick={onChangeModal}>Отмена</Button>
                <Button type="primary" onClick={handlePayment}>
                  Оплатить
                </Button>
              </div>
            </div>
          </Col>

          {/* Правая часть - чек */}
          <Col span={12}>
            <div style={{ border: '1px solid #d9d9d9', padding: '16px' }}>
              <Title level={4}>Alatau - 2</Title>
              <Text>Клиент: 69909992-08e0...</Text>
              <br />
              <Text>Жардин</Text>
              <br />
              <Text>Дата: 26.09.2024</Text>
              <br />
              <Text>Контакт: +7 (705)...</Text>
              <Divider />
              {/* Таблица товаров */}
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Наименование</th>
                    <th>Цена</th>
                    <th>Кол-во</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item: any, index: number) => (
                    <tr key={item.productId}>
                      <td>{index + 1}</td>
                      <td>{item.productName}</td>
                      <td>{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>{item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Divider />
              <Text>Скидка: {discount}%</Text>
              <br />
              <Text>Итого: {totalAmount} KZT</Text>
              <br />
              <Text>Итого со скидкой: {amountToPay} KZT</Text>
            </div>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default Payment;
