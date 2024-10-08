import { useEffect, useState } from 'react';
import { Button, Card, Col, Flex, Modal, Row, message } from 'antd';
import { TableItem } from '../../types/Table';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { selectTable, setTables } from './Tables.slice';
import { RootState } from '../../app/providers/StoreProvider';
import { OrderItem } from '../../types/Order';
import { addItemsFromTableOrder, clearOrder } from '../Order';
import { addClientFromTableOrder, clearClient } from '../Clients';
import { addDiscountFromTableOrder, clearDiscount } from '../Discount';
import { addUserFromTableOrder, clearUser } from '../Users';

interface TablesProps {
  onChangeModal: () => void;
  isTablesOpen: boolean;
}

const Tables = ({ onChangeModal, isTablesOpen }: TablesProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { selectedTable, tableOrders } = useAppSelector(
    (state: RootState) => state.tablesStore,
  );
  const { items, totalAmount } = useAppSelector(
    (state: RootState) => state.orderStore,
  );
  const [tablesState, setTablesState] = useState<TableItem[]>([]);

  const fetchTables = async () => {
    try {
      const fetchedTables = await window.electron.getTables();
      setTablesState(fetchedTables);
      dispatch(setTables(fetchedTables));
    } catch (error) {
      message.error('Не удалось загрузить столы');
    }
  };

  useEffect(() => {
    if (isTablesOpen) {
      fetchTables();
    }
  }, [isTablesOpen]);

  useEffect(() => {
    console.log('tableOrders from TableStore', tableOrders);
  }, [tableOrders]);

  const handleSelectTable = (id: number) => {
    const tableOrder = tableOrders.find((order) => order.tableId === id);
    console.log('seltabOr', tableOrder);
    dispatch(selectTable(id));
    if (tableOrder) {
      dispatch(addItemsFromTableOrder(tableOrder.orderItems ?? []));
      if (tableOrder.orderClient) {
        dispatch(addClientFromTableOrder(tableOrder.orderClient ?? null));
      }
      if (tableOrder.orderUser) {
        dispatch(addUserFromTableOrder(tableOrder.orderUser ?? null));
      }
      dispatch(addDiscountFromTableOrder(tableOrder.orderDiscount ?? 0));
    }
    if (!tableOrder) {
      dispatch(clearOrder());
      dispatch(clearClient());
      dispatch(clearDiscount());
      dispatch(clearUser());
    }
    onChangeModal();
  };

  return (
    <>
      <Button type="primary" onClick={() => onChangeModal()}>
        Столы
      </Button>
      <Modal
        title="Столы"
        open={isTablesOpen}
        footer={[]}
        onCancel={onChangeModal}
      >
        <Flex
          style={{
            width: '100%',
            minHeight: 'calc(100vh - 48px)',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <h2>Выберите стол</h2>
          <Row gutter={[16, 16]}>
            {tablesState.map((table) => (
              <Col key={table.id} span={6}>
                <Card
                  hoverable
                  onClick={() => handleSelectTable(table.id)}
                  style={{
                    backgroundColor: table.color,
                    border:
                      selectedTable?.id === table.id
                        ? '3px solid green'
                        : '1px solid gray',
                  }}
                >
                  <Card.Meta title={table.name} />
                </Card>
              </Col>
            ))}
          </Row>
        </Flex>
      </Modal>
    </>
  );
};

export default Tables;
