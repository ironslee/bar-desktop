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
import { syncTableOrder } from '../Tables';

const { Title } = Typography;

const Order = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { items, totalAmount } = useAppSelector(
    (state: RootState) => state.orderStore,
  );
  const tableId = useAppSelector(
    (state) => state.tablesStore.selectedTable?.id,
  );
  const orderItems = useAppSelector((state) => state.orderStore.items);

  const onChangeModal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    console.log('items from OrderStore', items);
  }, [items]);

  useEffect(() => {
    if (tableId) {
      dispatch(syncTableOrder({ tableId, orderItems }));
    }
  }, [tableId, orderItems, dispatch]);

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
            <Title level={5}>К оплате: {totalAmount} тенге</Title>
          </Col>
        </Row>

        <Row justify="space-between" style={{ marginTop: '20px' }}>
          <Button type="default">Пред печать</Button>
          <Button type="primary">Оплатить</Button>
        </Row>
      </Card>
    </>
  );
};

export default Order;
