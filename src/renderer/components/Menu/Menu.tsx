import './menu.scss';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Row,
  Col,
  message,
  Input,
  Flex,
  Carousel,
  Breadcrumb,
} from 'antd';
import { CloseCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { setCategories, setProducts, selectCategory } from './Menu.slice';
import { RootState } from '../../app/providers/StoreProvider';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { ProductItem } from '../../types/Product';
import { addItemToOrder } from '../Order';
import useDebounce from '../../hooks/useDebounce';

const Menu = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { categories, products, selectedCategory } = useAppSelector(
    (state: RootState) => state.menuStore,
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  // Запрос категорий при загрузке
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await window.electron.getCategories();
        const fetchedAllProducts = await window.electron.getAllProducts();
        dispatch(setCategories(fetchedCategories));
        setAllProducts(fetchedAllProducts);
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

  const filteredProducts = debouncedSearchQuery
    ? allProducts.filter((product) =>
        product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
      )
    : products;

  return (
    <Flex vertical className="menu_wrap">
      <Input
        placeholder="Поиск по блюдам"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '16px' }}
        className="input_search"
        allowClear
      />
      {/* <Input.Search
        placeholder="Поиск по блюдам"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        enterButton={
          searchQuery ? (
            <Button
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setSearchQuery('')}
            >
              <CloseCircleOutlined /> Очистить
            </Button>
          ) : (
            false
          )
        }
        style={{ marginBottom: '16px' }}
      /> */}

      {/* КЛАССИКА */}
      <Row gutter={[5, 5]} className="categories_wrap">
        {categories.map((category) => (
          <Col key={category.id} span={6}>
            <Button
              className="menu_category_card"
              onClick={() => handleSelectCategory(category.id)}
              style={{
                backgroundColor:
                  selectedCategory?.id === category.id ? '#16C787' : '',
                color: selectedCategory?.id === category.id ? '#fff' : '',
              }}
            >
              {category.name}
            </Button>
          </Col>
        ))}
      </Row>

      {/* СЛАЙДЕР */}
      {/* <Carousel
        dots={false}
        slidesToShow={4}
        slidesToScroll={4}
        arrows
        infinite
        draggable
      >
        {categories.map((category) => (
          <Button
            key={category.id}
            className="menu_category_card"
            onClick={() => handleSelectCategory(category.id)}
            style={{
              backgroundColor:
                selectedCategory?.id === category.id ? '#16C787' : '',
              color: selectedCategory?.id === category.id ? '#fff' : '',
            }}
          >
            {category.name}
          </Button>
        ))}
      </Carousel> */}

      {/* ХЛЕБНЫЕ КРОШКИ */}
      {/* <Breadcrumb className="breadcrumb_item" separator=">">
        <Breadcrumb.Item onClick={() => dispatch(selectCategory(null))}>
          <Button className="breadcrumb_link" type="link">
            Все категории
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Button type="link" className="breadcrumb_link">
            {' '}
            {selectedCategory ? selectedCategory.name : ''}
          </Button>
        </Breadcrumb.Item>
      </Breadcrumb>
      {!selectedCategory && (
        <Row gutter={[5, 5]} className="categories_wrap">
          {categories.map((category) => (
            <Col key={category.id} span={6}>
              <Button
                className="menu_category_card"
                onClick={() => handleSelectCategory(category.id)}
              >
                {category.name}
              </Button>
            </Col>
          ))}
        </Row>
      )}
      {selectedCategory && (
        <Row gutter={[5, 5]}>
          {filteredProducts.map((product) => (
            <Col key={product.id} span={6}>
              <Card
                className="menu_item_card"
                title={
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      whiteSpace: 'normal',
                    }}
                  >
                    {product.name}
                  </span>
                }
                cover={
                  product.link ? (
                    <img alt={product.name} src={product.link} />
                  ) : null
                }
                onClick={() => handleProductClick(product)}
              >
                {`Цена: ${product.retprice} тенге`}
              </Card>
            </Col>
          ))}
        </Row>
      )} */}

      <Row gutter={[5, 5]} style={{ marginTop: '16px' }}>
        {filteredProducts.map((product) => (
          <Col key={product.id} span={6}>
            <Card
              className="menu_item_card"
              title={
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    whiteSpace: 'normal',
                  }}
                >
                  {product.name}
                </span>
              }
              cover={
                product.link ? (
                  <img alt={product.name} src={product.link} />
                ) : null
              }
              onClick={() => handleProductClick(product)}
            >
              {`Цена: ${product.retprice} тенге`}
            </Card>
          </Col>
        ))}
      </Row>
    </Flex>
  );
};

export default Menu;
