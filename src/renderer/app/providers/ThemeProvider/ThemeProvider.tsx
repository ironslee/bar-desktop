import { ConfigProvider } from 'antd';
import { colors } from './colorPalette';

interface ThemeProviderProps {
  children: JSX.Element;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary,
          colorBgBase: colors.bgBase,
          colorText: colors.textColor,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;
