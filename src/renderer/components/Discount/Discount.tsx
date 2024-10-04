import React, { useEffect, useState } from 'react';
import { Button, Input, message, Modal } from 'antd';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setDiscount } from './Discount.slice';
import { useAppSelector } from '../../hooks/useAppSelector';

interface DiscountProps {
  onChangeModal: () => void;
  isOpen: boolean;
}

const Discount = ({ onChangeModal, isOpen }: DiscountProps): JSX.Element => {
  const [discountValue, setDiscountValue] = useState<number>(0); // Локальное состояние для поля скидки
  const dispatch = useAppDispatch();
  const { discount } = useAppSelector((state) => state.discountStore);

  useEffect(() => {
    if (!discount) {
      setDiscountValue(0);
    } else if (discount) {
      setDiscountValue(discount);
    }
  }, [discount]);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 0 && value <= 100) {
      setDiscountValue(value);
    } else {
      message.error('Введите корректный процент скидки (от 0 до 100)');
    }
  };

  const handleConfirmDiscount = () => {
    dispatch(setDiscount(discountValue));
    message.success(`Скидка ${discountValue}% установлена!`);
    onChangeModal();
  };

  const handleResetDiscount = () => {
    dispatch(setDiscount(0));
    setDiscountValue(0);
    message.success(`Скидка ${discountValue}% установлена!`);
    onChangeModal();
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => onChangeModal()}
        style={{ maxWidth: 150 }}
      >
        {`Скидка ${discount > 0 ? discount : 0}%`}
      </Button>
      <Modal
        title="Скидка"
        open={isOpen}
        footer={null}
        onCancel={onChangeModal}
      >
        <h3>Установить скидку</h3>
        <Input
          type="number"
          value={discountValue}
          onChange={handleDiscountChange}
          placeholder="Введите процент скидки"
          min={0}
          max={100}
        />
        <Button
          type="primary"
          onClick={handleConfirmDiscount}
          style={{ marginTop: '10px' }}
        >
          Подтвердить
        </Button>
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
