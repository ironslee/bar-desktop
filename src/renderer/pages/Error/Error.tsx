import { Button, Space } from "antd";
import { useEffect } from "react";
import { useNavigate, useRouteError } from "react-router-dom";

const Error = () => {
  const navigate = useNavigate();
  const error: any = useRouteError();

  useEffect(() => {
    console.log(error);
  }, [error]);

  const goHome = () => {
    navigate("/");
  };

  return (
    <Space direction="vertical" align="center">
      <h2>Что то пошло не так...</h2>
      <p>Код: {error?.status}</p>
      <p>Сообщение: {error?.error?.message}</p>
      <Button onClick={goHome}>Вернуться на Главную</Button>
    </Space>
  );
};

export default Error;
