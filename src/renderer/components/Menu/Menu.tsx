import React, { useEffect } from 'react';
import { Button, Card, Row, Col, message } from 'antd';
import { setCategories, setProducts, selectCategory } from './Menu.slice';
import { RootState } from '../../app/providers/StoreProvider';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { ProductItem } from '../../types/Product';
import { addItemToOrder } from '../Order';

const Menu = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { categories, products, selectedCategory } = useAppSelector(
    (state: RootState) => state.menuStore,
  );

  // Запрос категорий при загрузке
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await window.electron.getCategories();
        dispatch(setCategories(fetchedCategories));
      } catch (error) {
        message.error('Не удалось загрузить категории');
      }
    };

    fetchCategories();
  }, [dispatch]);

  // Запрос продуктов при выборе категории
  const handleSelectCategory = async (categoryId: number) => {
    try {
      const fetchedProducts =
        await window.electron.getProductsByCategory(categoryId);
      dispatch(selectCategory(categoryId));
      dispatch(setProducts(fetchedProducts));
    } catch (error) {
      message.error('Не удалось загрузить продукты');
    }
  };

  // Добавление продукта в заказ при клике
  const handleProductClick = (product: ProductItem) => {
    dispatch(addItemToOrder(product));
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        {categories.map((category) => (
          <Col key={category.id} span={6}>
            <Button
              onClick={() => handleSelectCategory(category.id)}
              style={{
                backgroundColor:
                  selectedCategory?.id === category.id ? '#1890ff' : '',
                color: selectedCategory?.id === category.id ? '#fff' : '',
              }}
            >
              {category.name}
            </Button>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        {products.map((product) => (
          <Col key={product.id} span={6}>
            <Card
              title={product.name}
              cover={<img alt={product.name} src={product.link} />}
              onClick={() => handleProductClick(product)}
            >
              {`Цена: ${product.retprice} тенге`}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Menu;
