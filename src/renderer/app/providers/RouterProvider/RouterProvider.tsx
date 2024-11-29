import { RouterProvider as Router, createHashRouter } from 'react-router-dom';
import RootLayout from '../../../components/RootLayout';
import Error from '../../../pages/Error';
import MainPage from '../../../pages/MainPage';
import { Upload } from '../../../pages/Upload';

export enum Routes {
  Home = '/',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Upload = '/upload',
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
        {
          path: Routes.Upload,
          element: <Upload />,
        },
      ],
    },
  ]);

  return <Router router={router} />;
};

export default RouterProvider;
