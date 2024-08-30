import { RouterProvider as Router, createHashRouter } from 'react-router-dom';
import RootLayout from '../../../components/RootLayout';
import Error from '../../../pages/Error';

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
      children: [],
    },
  ]);

  return <Router router={router} />;
};

export default RouterProvider;
