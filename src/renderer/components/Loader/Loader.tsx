import { Flex, Spin } from 'antd';
import { useAppSelector } from '../../hooks/useAppSelector';

interface LoaderProps {}

const Loader = ({}: LoaderProps): JSX.Element => {
  const isLoading = useAppSelector((state) => state.loadingStore.isLoading);

  if (!isLoading) {
    return <></>;
  }

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Spin spinning={isLoading} />
    </Flex>
  );
};

export default Loader;
