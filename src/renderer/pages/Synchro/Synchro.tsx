import { Button, Flex, Form, Input, Typography, message } from 'antd';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { Routes } from '../../app/providers/RouterProvider';
import { setLoading } from '../../components/Loader';
import api from '../../helpers/axios.middleware';
import { OrderToUpload } from '../../types/Order';
import { apiUrl } from '../../helpers/renderer-constants';
import { User } from '../../types/User';
import { setTokens } from '../Upload/Upload.slice';

interface UploadProps {}

const Synchro = ({}: UploadProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [uploadLog, setUploadLog] = useState<string[]>([]);
  const [user, setUser] = useState<User>({
    user_id: 0,
    username: '',
  });
  const tokens = useAppSelector((state) => state.uploadStore.tokens);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSynchroRunning, setIsSynchroRunning] = useState(false);

  // useEffect(() => {
  //   if (tokens.access_token) {
  //     console.log(tokens);
  //     // eslint-disable-next-line no-use-before-define
  //     getAccountInfo();
  //     // eslint-disable-next-line no-use-before-define
  //     onOrdersUpload();
  //   }
  // }, [tokens]);

  useEffect(() => {
    if (tokens.access_token && !isSynchroRunning) {
      setIsSynchroRunning(true); // Предотвращает повторное выполнение
      // eslint-disable-next-line no-use-before-define
      // getAccountInfo();
      // eslint-disable-next-line no-use-before-define
      onOrdersUpload();
    }
  }, [tokens]);

  useEffect(() => {
    try {
      const localTokens = window.localStorage.getItem('tokens');
      const parsedTokens = localTokens ? JSON.parse(localTokens) : null;

      if (parsedTokens && tokens.access_token === '') {
        dispatch(setTokens(parsedTokens));
      }
    } catch (error) {
      console.log(error);
    }

    if (navigator.onLine === false) {
      navigate(Routes.Home);
    }
  }, []);

  const getAccountInfo = async () => {
    try {
      dispatch(setLoading(true));

      const res = await api.get<User>(`/auth/users/me`);
      setUser(res.data);

      dispatch(setLoading(false));
    } catch (error: any) {
      console.log(error);
      message.error(error?.response?.data?.message || 'Ошибка');

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
      // const appId = await window.electron.getAppId();

      const data: OrderToUpload[] = orders.reduce<OrderToUpload[]>(
        (acc, item) => {
          acc.push({
            id: item.id,
            number: item.number,
            created_at: item.created_at,
            total_amount: item.total_amount,
            discount_id: item.discount_id,
            discount_total_amount: item.discount_total_amount,
            payment_type_id: item.payment_type_id,
            table_id: item.table_id,
            client: item.client,
            created_by: item.created_by,
            status: item.status,
            items: item.items,
          });

          return acc;
        },
        [],
      );
      console.log('data', data);
      const res = await api.post(`/desktop/orders`, data);

      // const savedOrders = res.data.reduce((acc: any, item: any) => {
      //   if (item.isSaved) {
      //     // eslint-disable-next-line no-param-reassign
      //     acc += 1;
      //   }
      //   return acc;
      // }, 0);

      // setUploadLog((prev) => {
      //   return [
      //     ...prev,
      //     `На сервер успешно загружено ${savedOrders ?? 0} заказов из ${
      //       data.length
      //     }`,
      //   ];
      // });

      // let logMessage =
      //   savedOrders !== data.length ? 'Ошибки по заказам:\n' : '';
      // // eslint-disable-next-line no-restricted-syntax
      // for (const result of res.data) {
      //   if (result.isSaved === false) {
      //     logMessage += `${result.errorMessage}\n`;
      //   }
      // }

      // setUploadLog((prev) => {
      //   return [...prev, logMessage];
      // });

      return true;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        dispatch(
          setTokens({
            access_token: '',
            token_type: '',
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

  let isUploading = false;

  // eslint-disable-next-line consistent-return
  const onOrdersUpload = async () => {
    if (isUploading) return; // Предотвращает повторный запуск
    try {
      setIsLoading(true);

      // Get orders yo upload
      setUploadLog(['Готовим заказы к загрузке...']);
      const ordersToUpload: OrderToUpload[] =
        await window.electron.getOrdersToUpload();

      console.log(ordersToUpload);

      if (ordersToUpload.length === 0) {
        message.success('Нет заказов для загрузки');
        setUploadLog((prev) => {
          return [...prev, 'Нет заказов для загрузки'];
        });
      }

      if (ordersToUpload.length !== 0) {
        // Upload orders to server
        setUploadLog((prev) => {
          return [...prev, 'Отправляем заказы на сервер...'];
        });
        const uploadResult = await uploadOrders(ordersToUpload);

        if (uploadResult === false) {
          setIsLoading(false);
          return;
        }

        // Change uploaded status on local db
        setUploadLog((prev) => {
          return [...prev, 'Обновляем загруженные заказы...'];
        });
        await window.electron.setUploadedOrders();
      }

      // End message
      setUploadLog((prev) => {
        return [...prev, 'Готово'];
      });
      setIsLoading(false);
      isUploading = true;
      setIsSynchroRunning(false);
      // navigate(Routes.Home);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ошибка');
      setUploadLog((prev) => {
        return [...prev, 'Ошибка синхронизации заказов...'];
      });
      console.log(error);

      setIsLoading(false);
      // navigate(Routes.Home);
    }
  };

  // const logout = () => {
  //   dispatch(
  //     setTokens({
  //       access_token: '',
  //       token_type: '',
  //     }),
  //   );
  // };

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
        Синхронизация заказов на сервере
      </Typography.Title>
      <Typography.Text>
        Обновление может занимать больше 10 минут, в зависимости от количества
        товаров и заказов на сервере. Не закрывайте программу и не выключайте
        компьютер
      </Typography.Text>

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
    </Flex>
  );
};

export default Synchro;
