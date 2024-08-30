import { Layout } from "antd";
import { CSSProperties, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { OPEN_ROUTE } from "../../../shared/constants";
import { IpcRendererEvent } from "electron";

interface RootLayoutProps {
  children?: JSX.Element;
}

const layoutStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "24px",
};

const RootLayout = ({ children }: RootLayoutProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenRoute = (event: IpcRendererEvent, route: string) => {
      console.log(event);
      navigate(route);
    };

    window.Electron.ipcRenderer.on(OPEN_ROUTE, handleOpenRoute);
  }, []);

  return <Layout style={layoutStyle}>{children ?? <Outlet />}</Layout>;
};

export default RootLayout;
