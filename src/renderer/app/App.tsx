import { Provider } from 'react-redux';
import { message } from 'antd';
import { store } from './providers/StoreProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { RouterProvider } from './providers/RouterProvider';
import { Loader } from '../components/Loader';
import 'renderer/styles/index.scss';
import 'antd/dist/reset.css';

const App = () => {
  const [_, contextHolder] = message.useMessage();

  message.config({
    duration: 2,
    maxCount: 3,
  });

  return (
    <ThemeProvider>
      <Provider store={store}>
        <RouterProvider />

        <Loader />

        {contextHolder}
      </Provider>
    </ThemeProvider>
  );
};

export default App;
