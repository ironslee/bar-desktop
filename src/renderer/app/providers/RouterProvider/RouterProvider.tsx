import { RouterProvider as Router, createHashRouter } from 'react-router-dom';
import RootLayout from '../../../components/RootLayout';
import Error from '../../../pages/Error';
import MainPage from '../../../pages/MainPage';

export enum Routes {
  Home = '/',
}

const RouterProvider = () => {
  const router = createHashRouter([
    {
      path: Routes.Home,
      element: <RootLayout />,
      errorElement: (
        <RootLayout>
          <Error />
        </RootLayout>
      ),
      children: [
        {
          index: true,
          element: <MainPage />,
        },
      ],
    },
  ]);

  return <Router router={router} />;
};

export default RouterProvider;
