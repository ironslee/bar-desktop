import { Button, Form, Input, Typography, message } from 'antd';
import './SignIn.module.scss';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import {
//   LocalStorageKeys,
//   useLocalStorage,
// } from 'shared/hooks/useLocalStorage';
// import { routes } from 'shared/constants/routes';
// import {
//   Tokens,
//   useGetUserByTokenMutation,
//   useSignInMutation,
//   userActions,
// } from 'entities/user';
// import { loaderActions } from 'shared/ui/Loader';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setTokens } from '../../pages/Upload';
import { Routes } from '../../app/providers/RouterProvider';
import { setLoading } from '../Loader';
import api from '../../helpers/axios.middleware';
import { User } from '../../types/User';

interface SigninFormProps {}

const SigninForm = ({}: SigninFormProps): JSX.Element => {
  const [form] = Form.useForm();
  // const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  // const [, setTokens] = useLocalStorage<null | Tokens>(
  //   LocalStorageKeys.TOKENS,
  //   null,
  // );
  const tokens = useAppSelector((state) => state.uploadStore.tokens);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const [signIn] = useSignInMutation();
  // const [getUser] = useGetUserByTokenMutation();

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

  const onFinish = async () => {
    try {
      dispatch(setLoading(true));

      const data = {
        password: formData.password,
        username: formData.username,
      };

      const res = await api.post(`/auth/token`, data);

      dispatch(setTokens(res.data));
      window.localStorage.setItem('tokens', JSON.stringify(res.data));

      dispatch(setLoading(false));
      message.success('Авторизация прошла успешно');
    } catch (error: any) {
      console.log(error);
      message.error(error?.response?.data?.message || 'Ошибка');

      // eslint-disable-next-line no-use-before-define
      logout();

      dispatch(setLoading(false));
    }
  };

  const getAccountInfo = async () => {
    try {
      dispatch(setLoading(true));

      const res = await api.get<User>(`/auth/users/me
`);
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

  const onChange =
    (key: keyof typeof formData) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => {
        return {
          ...prev,
          [key]: event.target.value,
        };
      });
    };

  // const onFinish = async () => {
  //   try {
  //     dispatch(loaderActions.setIsLoading(true));

  //     setError('');
  //     await form.validateFields();

  //     const tokens = await signIn(formData);

  //     if ('data' in tokens) {
  //       dispatch(userActions.setTokens(tokens.data));
  //       setTokens(tokens.data);
  //     }

  //     if ('error' in tokens) {
  //       throw tokens.error;
  //     }

  //     const user = await getUser();

  //     if ('data' in user) {
  //       dispatch(userActions.setUser(user.data));
  //       dispatch(userActions.setAuthorized(true));
  //     }

  //     if ('error' in user) {
  //       throw user.error;
  //     }

  //     navigate(routes.HOME);

  //     message.open({
  //       type: 'success',
  //       content: 'Пользователь успешно авторизован',
  //     });

  //     dispatch(loaderActions.setIsLoading(false));

  //     // eslint-disable-next-line
  //   } catch (error: any) {
  //     message.open({
  //       type: 'error',
  //       content: error.message || 'Sign in failed...',
  //     });

  //     dispatch(loaderActions.setIsLoading(false));
  //   }
  // };

  // const onFinishFailed = () => {
  //   setError('Введите логин и пароль');
  // };

  const logout = () => {
    dispatch(
      setTokens({
        token: '',
        refreshToken: '',
        tokenType: '',
      }),
    );
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      // onFinishFailed={onFinishFailed}
    >
      <Typography.Title level={3} style={{ marginBottom: '4px' }}>
        Добро пожаловать!
      </Typography.Title>
      <Typography.Text
        type="secondary"
        style={{ display: 'block', marginBottom: '32px' }}
      >
        Войдите в свою учетную запись, чтобы продолжить
      </Typography.Text>

      {/* {error && (
        <Typography.Text
          type="danger"
          style={{
            display: 'block',
            marginBottom: '24px',
          }}
        >
          {error}
        </Typography.Text>
      )} */}

      <Form.Item
        label="Учетная запись"
        name="login"
        rules={[{ required: true, message: '' }]}
        style={{ width: '100%' }}
      >
        <Input
          placeholder="Логин"
          value={formData.username}
          onChange={onChange('username')}
        />
      </Form.Item>

      <Form.Item
        label="Пароль"
        name="password"
        rules={[{ required: true, message: '' }]}
        style={{ width: '100%' }}
      >
        <Input.Password
          value={formData.password}
          onChange={onChange('password')}
        />
      </Form.Item>

      <Form.Item
        style={{
          justifyContent: 'flex-end',
          width: '100%',
          marginBottom: '24px',
          textAlign: 'right',
        }}
      >
        <Button
          type="link"
          style={{
            width: 'auto',
          }}
        >
          Забыли пароль?
        </Button>
      </Form.Item>

      <Button type="primary" htmlType="submit" block>
        Войти
      </Button>
    </Form>
  );
};

export default SigninForm;
