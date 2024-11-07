import './clients.scss';
import { useEffect, useState } from 'react';
import { Button, Input, Modal, Table, message } from 'antd';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setClients, selectClient } from './Clients.slice';
import { RootState } from '../../app/providers/StoreProvider';
import { ClientItem } from '../../types/Client';
import useDebounce from '../../hooks/useDebounce';

interface ClientsProps {
  onChangeModal: () => void;
  isOpen: boolean;
}

const Clients = ({ onChangeModal, isOpen }: ClientsProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { selectedClient } = useAppSelector(
    (state: RootState) => state.clientsStore,
  );
  const { tableOrders, selectedTable } = useAppSelector(
    (state: RootState) => state.tablesStore,
  );
  const [clientsState, setClientsState] = useState<ClientItem[]>([]);
  const [searchItem, setSearchItem] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const debouncedSearchItem = useDebounce(searchItem, 300);
  const filteredClients = clientsState.filter((client) =>
    client.name.toLowerCase().includes(debouncedSearchItem.toLowerCase()),
  );
  const tableOrder = tableOrders.find(
    (order) => order.tableId === selectedTable?.id,
  );
  const fetchClients = async () => {
    try {
      setLoading(true);
      const fetchedClients = await window.electron.getClients();
      setClientsState(fetchedClients);
      dispatch(setClients(fetchedClients));
    } catch (error) {
      message.error('Не удалось загрузить клиентов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const handleSelectClient = async (record: ClientItem) => {
    dispatch(selectClient(record.id));
    try {
      // Здесь вызывается функция сервиса для проверки и обновления открытого заказа
      if (tableOrder?.checkNumber) {
        await window.electron.updateOpenOrderClient(
          record.id,
          tableOrder.checkNumber,
        );
      }
    } catch {
      // Ошибки обрабатываются без вывода сообщений
    }
    onChangeModal();
  };

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Номер',
      dataIndex: 'number',
      key: 'number',
    },
  ];

  return (
    <>
      <Button
        type="primary"
        onClick={() => onChangeModal()}
        style={{ width: '100%', fontSize: '17px' }}
      >
        {selectedClient ? `Клиент ${selectedClient.name}` : 'Клиент не выбран'}
      </Button>
      <Modal
        title="Клиенты"
        open={isOpen}
        footer={null}
        onCancel={onChangeModal}
      >
        <Input
          placeholder="Поиск по имени"
          onChange={(e) => setSearchItem(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          onRow={(record) => ({
            onClick: () => handleSelectClient(record),
          })}
          rowClassName={(record) =>
            record.id === selectedClient?.id ? 'selected-row' : ''
          }
        />
      </Modal>
    </>
  );
};

export default Clients;
