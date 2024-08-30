import { Layout } from 'antd';
import { CSSProperties, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { IpcRendererEvent } from 'electron';
import { OPEN_ROUTE } from '../../../shared/constants';

interface RootLayoutProps {
  children?: JSX.Element;
}

const layoutStyle: CSSProperties = {
  minHeight: '100vh',
  padding: '24px',
};

const RootLayout = ({ children }: RootLayoutProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenRoute = (route: unknown) => {
      navigate(route as string);
    };

    window.electron.ipcRenderer.on(OPEN_ROUTE, handleOpenRoute);
  }, []);

  return <Layout style={layoutStyle}>{children ?? <Outlet />}</Layout>;
};

export default RootLayout;
