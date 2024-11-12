import moment from 'moment';
import { Col, Divider, Flex, Typography } from 'antd';
import { OrderItem } from '../../types/Order';
import './check.scss';
import { TableOrder } from '../Tables/Tables.slice';
import { DiscountItem } from '../../types/Discount';

interface CheckProps {
  amountToPay: number;
  discount?: DiscountItem | null;
  totalAmount: number;
  tableOrder: TableOrder | undefined;
}

const Check = ({
  amountToPay,
  discount,
  totalAmount,
  tableOrder,
}: CheckProps): JSX.Element => {
  const productData =
    tableOrder?.orderItems?.map((item, index) => ({
      key: index + 1,
      name: item.product.name,
      price: item.product.retprice,
      quantity: item.quantity,
      total: item.totalPrice,
    })) || [];

  return (
    <>
      {/* ------------------------------------------------- */}
      <Flex vertical className="check">
        <Flex vertical align="center">
          <Typography.Title level={5} style={{ marginBottom: 0 }}>
            Barista
          </Typography.Title>
          <Typography.Title
            level={5}
            style={{
              marginTop: 0,
              marginBottom: '8px',
              padding: '0 12px',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            Чек {tableOrder?.checkNumber}
          </Typography.Title>
        </Flex>

        <div className="data-line">
          <span>Дата: </span>
          <span>{moment().format('DD.MM.YYYY, hh:mm')}</span>
        </div>
        <div className="data-line">
          <span>Клиент: </span>
          <span>{tableOrder?.orderClient?.name ?? ''}</span>
        </div>
        <div className="data-line">
          <span>Контакты клиента: </span>
          <span>{tableOrder?.orderClient?.number ?? ''}</span>
        </div>

        <table className="products">
          <thead>
            <tr>
              <th>№</th>
              <th>Наименование</th>
              <th>Цена</th>
              <th>Кол.</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {productData.map((item) => (
              <tr key={item.key}>
                <td>{item.key}</td>
                <td>{item.name}</td>
                <td>{item.price}</td>
                <td>{item.quantity}</td>
                <td>{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* <span
          style={{
            display: 'block',
            textAlign: 'right',
            marginTop: '4mm',
            fontWeight: 'bold',
          }}
        >
          {paymentsList.map((payment) => (
            <div key={payment.code}>
              {payment.label}: {payment.amount} тг
            </div>
          ))}
        </span> */}

        <span
          style={{
            display: 'block',
            textAlign: 'right',
            marginTop: '2mm',
            fontWeight: 'bold',
          }}
        >
          Скидка: {discount?.discount_value ?? 0}%
        </span>

        <span
          style={{
            display: 'block',
            textAlign: 'right',
            marginTop: '2mm',
            fontWeight: 'bold',
          }}
        >
          ИТОГО: {totalAmount} тг
        </span>

        <span
          style={{
            display: 'block',
            textAlign: 'right',
            marginTop: '2mm',
            fontWeight: 'bold',
          }}
        >
          ИТОГО СО СКИДКОЙ: {amountToPay} тг
        </span>

        {/* <span
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: '4mm',
            fontWeight: 'bold',
            fontSize: '12px',
          }}
        >
          Телефон: +7 (777) 123-45-67
          <br />
          Адрес: ул.Гоголя 7, 25
        </span> */}
      </Flex>
    </>
  );
};

export default Check;
