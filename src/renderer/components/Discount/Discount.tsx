import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Flex, Input, message, Modal, Row } from 'antd';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import {
  selectDiscount,
  setDiscount,
  setDiscountItems,
} from './Discount.slice';
import { useAppSelector } from '../../hooks/useAppSelector';
import { DiscountItem } from '../../types/Discount';
import { RootState } from '../../app/providers/StoreProvider';

interface DiscountProps {
  onChangeModal: () => void;
  isOpen: boolean;
}

const Discount = ({ onChangeModal, isOpen }: DiscountProps): JSX.Element => {
  const [discountValue, setDiscountValue] = useState<number>(0); // Локальное состояние для поля скидки
  const dispatch = useAppDispatch();
  const { discount, selectedDiscount } = useAppSelector(
    (state) => state.discountStore,
  );
  const { tableOrders, selectedTable } = useAppSelector(
    (state: RootState) => state.tablesStore,
  );
  const tableOrder = tableOrders.find(
    (order) => order.tableId === selectedTable?.id,
  );
  const [discountState, setDiscountState] = useState<DiscountItem[]>([]);

  const fetchDiscount = async () => {
    try {
      const fetchedDiscount = await window.electron.getDiscount();
      setDiscountState(fetchedDiscount);
      dispatch(setDiscountItems(fetchedDiscount));
      // dispatch(setDiscountValue(fetchedDiscount));
    } catch (error) {
      message.error('Не удалось загрузить столы');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDiscount();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedDiscount) {
      setDiscountValue(0);
    } else if (selectedDiscount) {
      setDiscountValue(selectedDiscount.discount_value);
    }
    console.log('DISCOUNTVALUE ', discountValue);
  }, [selectedDiscount]);

  // const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = Number(e.target.value);
  //   if (value >= 0 && value <= 100) {
  //     setDiscountValue(value);
  //   } else {
  //     message.error('Введите корректный процент скидки (от 0 до 100)');
  //   }
  // };

  const handleConfirmDiscount = () => {
    onChangeModal();
  };

  const handleSelectDiscount = async (record: DiscountItem) => {
    await dispatch(selectDiscount(record.id));
    // setDiscountValue(record.discount_value);

    // const updatedDiscount = discountState.find((disc) => disc.id === id);

    // if (updatedDiscount) {
    //   setDiscountValue(updatedDiscount.discount_value);
    //   dispatch(setDiscount(updatedDiscount.discount_value));

    //   message.success(`Скидка ${updatedDiscount.discount_value}% установлена!`);
    // }
    try {
      // Здесь вызывается функция сервиса для проверки и обновления открытого заказа
      if (tableOrder?.checkNumber) {
        await window.electron.updateOpenOrderDiscount(
          record.id,
          tableOrder.checkNumber,
        );
      }
    } catch {
      // Ошибки обрабатываются без вывода сообщений
    }
    message.success(`Скидка ${record.discount_value}% установлена!`);
    onChangeModal();
  };

  const handleResetDiscount = async () => {
    // dispatch(setDiscount(0));
    // setDiscountValue(0);
    // message.success(`Скидка ${discountValue}% установлена!`);
    await dispatch(selectDiscount(null));

    try {
      // Здесь вызывается функция сервиса для проверки и обновления открытого заказа
      if (tableOrder?.checkNumber) {
        await window.electron.updateOpenOrderDiscount(
          null,
          tableOrder.checkNumber,
        );
      }
    } catch {
      // Ошибки обрабатываются без вывода сообщений
    }
    message.success(`Скидка сброшена!`);

    onChangeModal();
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => onChangeModal()}
        style={{ width: '100%', fontSize: '17px' }}
      >
        {`Скидка ${selectedDiscount ? selectedDiscount?.discount_value : 0}%`}
      </Button>
      <Modal
        title="Скидка"
        open={isOpen}
        footer={null}
        onCancel={onChangeModal}
      >
        {/* <h3>Установить скидку</h3>
        <Input
          type="number"
          value={discountValue}
          onChange={handleDiscountChange}
          placeholder="Введите процент скидки"
          min={0}
          max={100}
        /> */}
        <Flex
          style={{
            width: '100%',
            minHeight: 'calc(100vh - 48px)',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <h2>Выберите стол</h2>
          <Row gutter={[16, 16]}>
            {discountState.map((record) => (
              <Col key={record.id} span={6}>
                <Card
                  hoverable
                  onClick={() => handleSelectDiscount(record)}
                  style={{
                    backgroundColor: 'white',
                    border: '3px solid green',
                  }}
                >
                  <Card.Meta title={record.discount_value} />
                </Card>
              </Col>
            ))}
          </Row>
        </Flex>
        {/* <Button
          type="primary"
          onClick={handleConfirmDiscount}
          style={{ marginTop: '10px' }}
        >
          Подтвердить
        </Button> */}
        <Button
          type="default"
          onClick={handleResetDiscount}
          style={{ marginTop: '10px' }}
        >
          Сбросить
        </Button>
      </Modal>
    </>
  );
};

export default Discount;
