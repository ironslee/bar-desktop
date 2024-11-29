import { Button, Flex, Form, Input, Typography, message } from 'antd';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { paymentTypesList, storeId } from 'renderer/helpers/renderer-constants';

import {
  OrderToUpload,
  UploadOrdersData,
  UploadOrdersItem,
  UploadOrdersResponseItem,
} from 'types/Order';
import { PaymentType, UploadOrdersPaymentItem } from 'types/Payment';
import { UploadOrdersProductItem } from 'types/Product';
import { User } from 'types/User';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setTokens } from './Upload.slice';
import { Routes } from '../../app/providers/RouterProvider';
import { setLoading } from '../../components/Loader';
import api from '../../helpers/axios.middleware';

interface UploadProps {}

const Upload = ({}: UploadProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [uploadLog, setUploadLog] = useState<string[]>([]);
  const [user, setUser] = useState<User>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: null,
    gender: null,
    stores: null,
  });
  const tokens = useAppSelector((state) => state.uploadStore.tokens);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (tokens.token) {
      // eslint-disable-next-line no-use-before-define
      getAccountInfo();
    }
  }, [tokens]);

  useEffect(() => {
    try {
      const localTokens = window.localStorage.getItem('tokens');
      const parsedTokens = localTokens ? JSON.parse(localTokens) : null;

      if (parsedTokens) {
        dispatch(setTokens(parsedTokens));
      }
    } catch (error) {
      console.log(error);
    }

    if (navigator.onLine === false) {
      navigate(Routes.Home);
    }
  }, []);

  // const onFinish = async () => {
  //   try {
  //     dispatch(setLoading(true));

  //     const data = {
  //       password: formData.password,
  //       username: formData.phone.replace(/[^0-9]/g, '').slice(1),
  //     };

  //     const res = await api.post(`/auth/signin`, data);

  //     dispatch(setTokens(res.data));
  //     window.localStorage.setItem('tokens', JSON.stringify(res.data));

  //     dispatch(setLoading(false));
  //     message.success('Авторизация прошла успешно');
  //   } catch (error: any) {
  //     console.log(error);
  //     message.error(error?.response?.data?.message || 'Ошибка');

  //     logout();

  //     dispatch(setLoading(false));
  //   }
  // };

  const getAccountInfo = async () => {
    try {
      dispatch(setLoading(true));

      const res = await api.get<User>(`/auth/me`);
      // setUser(res.data);

      dispatch(setLoading(false));
    } catch (error: any) {
      console.log(error);
      message.error(error?.response?.data?.message || 'Ошибка');

      // eslint-disable-next-line no-use-before-define
      logout();

      dispatch(setLoading(false));
    }
  };

  const onChangeForm =
    (key: keyof typeof formData) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => {
        return {
          ...prev,
          [key]: event.target.value,
        };
      });
    };

  const uploadOrders = async (orders: OrderToUpload[]) => {
    try {
      const appId = await window.electron.getAppId();

      const data: UploadOrdersData = orders.reduce<UploadOrdersItem[]>(
        (acc, item) => {
          acc.push({
            externalId: `${appId}-${item.orderId}`,
            client: {
              id: item.clientId,
            },
            isRetail: item.isRetail,
            store: {
              id: storeId,
            },
            totalAmount: item.totalAmount,
            paymentList: paymentTypesList.reduce<UploadOrdersPaymentItem[]>(
              (acc, payment) => {
                switch (payment.code) {
                  case PaymentType.CASH:
                    acc.push({
                      amount: item.cashAmount,
                      paymentType: {
                        id: payment.value,
                      },
                    });
                    break;

                  case PaymentType.CARD:
                    acc.push({
                      amount: item.cardAmount,
                      paymentType: {
                        id: payment.value,
                      },
                    });
                    break;

                  case PaymentType.DEPT:
                    acc.push({
                      amount: item.deptAmount,
                      paymentType: {
                        id: payment.value,
                      },
                    });
                    break;

                  default:
                    break;
                }

                return acc;
              },
              [],
            ),
            saleItemList: item.products.reduce<UploadOrdersProductItem[]>(
              (acc, product) => {
                acc.push({
                  product: {
                    id: product.productId,
                  },
                  quantity: product.quantity,
                });

                return acc;
              },
              [],
            ),
            occurredOn: item.occurredOn,
            beforeDiscountTotalAmount: item.beforeDiscountTotalAmount,
            discountPercentage: item.discountPercentage,
          });

          return acc;
        },
        [],
      );

      const res = await api.post<UploadOrdersResponseItem[]>(
        `/api/sales/batch`,
        data,
      );

      const savedOrders = res.data.reduce((acc, item) => {
        if (item.isSaved) {
          acc += 1;
        }
        return acc;
      }, 0);

      setUploadLog((prev) => {
        return [
          ...prev,
          `На сервер успешно загружено ${savedOrders ?? 0} заказов из ${
            data.length
          }`,
        ];
      });

      let logMessage =
        savedOrders !== data.length ? 'Ошибки по заказам:\n' : '';
      for (const result of res.data) {
        if (result.isSaved === false) {
          logMessage += result.errorMessage + '\n';
        }
      }

      setUploadLog((prev) => {
        return [...prev, logMessage];
      });

      return true;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        dispatch(
          setTokens({
            token: '',
            refreshToken: '',
            tokenType: '',
          }),
        );

        window.localStorage.removeItem('tokens');
      }

      setUploadLog((prev) => {
        return [
          ...prev,
          error?.response?.data?.message ||
            'Ошибка при загрузке заказов на сервер',
        ];
      });

      return false;
    }
  };

  const downloadTablesCsv = async () => {
    try {
      const res = await window.electron.importTables(tokens.token);

      return true;
    } catch (error: any) {
      console.log(error);
      setUploadLog((prev) => {
        return [
          ...prev,
          error?.response?.data?.message || 'Ошибка загрузки столов с сервера',
        ];
      });

      return false;
    }
  };

  const downloadCategoriesCsv = async () => {
    try {
      const res = await window.electron.importCategories(tokens.token);

      return true;
    } catch (error: any) {
      console.log(error);
      setUploadLog((prev) => {
        return [
          ...prev,
          error?.response?.data?.message ||
            'Ошибка загрузки категорий с сервера',
        ];
      });

      return false;
    }
  };

  const downloadProductsCsv = async () => {
    try {
      const res = await window.electron.importProducts(tokens.token);

      return true;
    } catch (error: any) {
      console.log(error);
      setUploadLog((prev) => {
        return [
          ...prev,
          error?.response?.data?.message || 'Ошибка загрузки блюд с сервера',
        ];
      });

      return false;
    }
  };

  const downloadClientsCsv = async () => {
    try {
      const res = await window.electron.importClients(tokens.token);

      return true;
    } catch (error: any) {
      console.log(error);
      setUploadLog((prev) => {
        return [
          ...prev,
          error?.response?.data?.message ||
            'Ошибка загрузки клиентов с сервера',
        ];
      });

      return false;
    }
  };

  const downloadDiscountsCsv = async () => {
    try {
      const res = await window.electron.importDiscount(tokens.token);

      return true;
    } catch (error: any) {
      console.log(error);
      setUploadLog((prev) => {
        return [
          ...prev,
          error?.response?.data?.message || 'Ошибка загрузки скидок с сервера',
        ];
      });

      return false;
    }
  };

  // eslint-disable-next-line consistent-return
  const onUpdate = async () => {
    try {
      setIsLoading(true);

      // Get orders yo upload
      setUploadLog(['Готовим заказы к загрузке...']);
      const ordersToUpload: OrderToUpload[] =
        await window.electron.getOrdersToUpload();

      console.log(ordersToUpload);

      if (ordersToUpload.length !== 0) {
        // Upload orders to server
        setUploadLog((prev) => {
          return [...prev, 'Отправляем заказы на сервер...'];
        });
        const uploadResult = await uploadOrders(ordersToUpload);

        if (uploadResult === false) {
          setIsLoading(false);
          return false;
        }

        // Change uploaded status on local db
        setUploadLog((prev) => {
          return [...prev, 'Обновляем загруженные заказы...'];
        });
        await window.electron.setUploadedOrders();
      }

      // Download tables from server
      setUploadLog((prev) => {
        return [
          ...prev,
          'Скачиваем список столов с сервера и обновляем локальную БД...',
        ];
      });
      const downloadTables = await downloadTablesCsv();

      if (downloadTables === false) {
        setIsLoading(false);
        return false;
      }

      // Download categories from server
      setUploadLog((prev) => {
        return [
          ...prev,
          'Скачиваем список категорий с сервера и обновляем локальную БД...',
        ];
      });
      const downloadCategories = await downloadCategoriesCsv();

      if (downloadCategories === false) {
        setIsLoading(false);
        return false;
      }

      // Download products from server
      setUploadLog((prev) => {
        return [
          ...prev,
          'Скачиваем товары с сервера и обновляем локальную БД...',
        ];
      });
      const downloadProducts = await downloadProductsCsv();

      if (downloadProducts === false) {
        setIsLoading(false);
        return false;
      }

      // Download clients from server
      setUploadLog((prev) => {
        return [
          ...prev,
          'Скачиваем список клиентов с сервера и обновляем локальную БД...',
        ];
      });
      const downloadClients = await downloadClientsCsv();

      if (downloadClients === false) {
        setIsLoading(false);
        return false;
      }

      // Download discounts from server
      setUploadLog((prev) => {
        return [
          ...prev,
          'Скачиваем список скидок с сервера и обновляем локальную БД...',
        ];
      });
      const downloadDiscounts = await downloadDiscountsCsv();

      if (downloadDiscounts === false) {
        setIsLoading(false);
        return false;
      }

      // End message
      setUploadLog((prev) => {
        return [...prev, 'Готово'];
      });
      setIsLoading(false);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ошибка');
      setUploadLog((prev) => {
        return [...prev, 'Ошибка, попробуйте заново...'];
      });
      console.log(error);

      setIsLoading(false);
    }
  };

  // eslint-disable-next-line consistent-return
  const onProductsUpdate = async () => {
    try {
      setIsLoading(true);

      // Download products from server
      setUploadLog(() => {
        return ['Скачиваем товары с сервера и обновляем локальную БД...'];
      });
      const downloadProducts = await downloadProductsCsv();

      if (downloadProducts === false) {
        setIsLoading(false);
        return false;
      }

      // End message
      setUploadLog((prev) => {
        return [...prev, 'Готово'];
      });
      setIsLoading(false);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ошибка');
      setUploadLog((prev) => {
        return [...prev, 'Ошибка, попробуйте заново...'];
      });
      console.log(error);

      setIsLoading(false);
    }
  };

  const logout = () => {
    dispatch(
      setTokens({
        token: '',
        refreshToken: '',
        tokenType: '',
      }),
    );
  };

  // if (!tokens.token) {
  //   return (
  //     <Flex
  //       justify="center"
  //       align="center"
  //       vertical
  //       style={{
  //         width: '100%',
  //         minHeight: 'calc(100vh - 48px)',
  //       }}
  //     >
  //       <Typography.Title level={4} style={{ marginBottom: '32px' }}>
  //         Для загрузки заказов и обновления товаров, необходима авторизация
  //       </Typography.Title>

  //       <Form
  //         onFinish={onFinish}
  //         autoComplete="off"
  //         layout="vertical"
  //         style={{
  //           width: '300px',
  //           padding: '16px',
  //           borderRadius: '4px',
  //           background: colors.whiteColor,
  //         }}
  //       >
  //         <Typography.Title
  //           level={4}
  //           style={{ marginBottom: '16px', textAlign: 'center' }}
  //         >
  //           Авторизация
  //         </Typography.Title>

  //         <Form.Item
  //           label="Телефон"
  //           name="phone"
  //           rules={[
  //             { required: true, message: 'Введите номер телефона' },
  //             {
  //               validator: (_, value: string) => {
  //                 if (!value) {
  //                   return Promise.resolve();
  //                 }

  //                 if (value.replaceAll('_', '').length === 18) {
  //                   return Promise.resolve();
  //                 } else {
  //                   return Promise.reject('Неверный формат телефона');
  //                 }
  //               },
  //             },
  //           ]}
  //         >
  //           <MaskedInput
  //             onChange={onChangeForm('phone')}
  //             value={formData.phone}
  //             mask={'+7 (999) 999-99-99'}
  //           />
  //         </Form.Item>

  //         <Form.Item
  //           label="Пароль"
  //           name="password"
  //           rules={[{ required: true, message: 'Введите пароль' }]}
  //         >
  //           <Input.Password
  //             onChange={onChangeForm('password')}
  //             value={formData.password}
  //           />
  //         </Form.Item>

  //         <Flex gap={'16px'} justify="flex-end">
  //           <Button type="default" onClick={() => navigate(Routes.Home)}>
  //             Назад
  //           </Button>
  //           <Button type="primary" htmlType="submit">
  //             Войти
  //           </Button>
  //         </Flex>
  //       </Form>
  //     </Flex>
  //   );
  // }

  return (
    <Flex
      vertical
      align="flex-start"
      gap="16px"
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 48px)',
      }}
    >
      <Typography.Title level={3}>
        Загрузка продуктов и обновление заказов
      </Typography.Title>
      <Typography.Text>
        Обновление может занимать больше 10 минут, в зависимости от количества
        товаров и заказов на сервере. Не закрывайте программу и не выключайте
        компьютер
      </Typography.Text>
      <Button
        size="large"
        type="primary"
        loading={isLoading}
        onClick={onUpdate}
      >
        Обновить товары и заказы
      </Button>

      {uploadLog.length !== 0 && (
        <div
          style={{
            width: '100%',
            padding: '16px',
            background: '#242A31',
            borderRadius: '8px',
          }}
        >
          {uploadLog.map((log, index) => (
            <div
              className="log-item"
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              style={{
                color: '#fff',
                padding: '4px',
              }}
            >
              {log.split('\n').map((log2, index2) => (
                <Typography.Text
                  // eslint-disable-next-line react/no-array-index-key
                  key={index2}
                  style={{
                    display: 'block',
                    color: '#fff',
                    background: 'transparent',
                    fontFamily:
                      "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,Courier,monospace'",
                  }}
                >
                  {log2}
                </Typography.Text>
              ))}
            </div>
          ))}
        </div>
      )}

      <Flex
        style={{
          width: '100%',
          marginTop: 'auto',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button
          size="large"
          loading={isLoading}
          onClick={() => navigate(Routes.Home)}
        >
          Вернуться в Кассу
        </Button>

        <Button size="large" danger loading={isLoading} onClick={logout}>
          Выйти
        </Button>
      </Flex>
    </Flex>
  );
};

export default Upload;
