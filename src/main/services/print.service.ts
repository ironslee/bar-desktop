import {
  PosPrintData,
  PosPrintOptions,
  PosPrinter,
} from 'electron-pos-printer';
import moment from 'moment';
import log from 'electron-log';
import { KitchenTicket } from '../../renderer/types/Print';

export const printKitchenTicket = async (
  kitchenTicket: KitchenTicket,
): Promise<boolean> => {
  try {
    const date = moment().format('DD.MM.YYYY, hh:mm');

    const options: PosPrintOptions = {
      boolean: false,
      // preview: true,
      silent: true,
      margin: '0 0 0 0',
      margins: {
        marginType: 'none',
      },
      copies: 1,
      printerName: '',
      pageSize: '80mm',
      timeOutPerLine: 5000,
    };

    const data: PosPrintData[] = [
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: `Стол ${kitchenTicket.table}`,
        style: {
          fontWeight: '700',
          textAlign: 'center',
          fontSize: '16px',
          marginBottom: '4px',
        },
      },
      {
        type: 'table',
        // style the table
        style: {
          border: '1px solid transparent',
          color: '#000',
          fontSize: '12px',
          borderCollapse: 'unset',
          marginBottom: '16px',
        },
        // list of the columns to be rendered in the table header
        tableHeader: ['', ''],
        // multi dimensional array depicting the rows and columns of the table body
        tableBody: [
          [
            {
              type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
              value: 'Дата: ',
              style: {
                fontWeight: '600',
                textAlign: 'left',
              },
            },
            {
              type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
              value: date,
              style: {
                fontWeight: '600',
                textAlign: 'right',
              },
            },
          ],
        ],
        // custom style for the table header
        tableHeaderStyle: {},
        // custom style for the table body
        tableBodyStyle: { border: '1px solid transparent' },
        // custom style for the table footer
        tableFooterStyle: {},
      },
      {
        type: 'table',
        // style the table
        style: {
          border: '1px solid #000',
          color: '#000',
          fontSize: '12px',
          marginBottom: '16px',
        },
        // list of the columns to be rendered in the table header
        tableHeader: ['№', 'Наимен.', 'Кол.'],
        // multi dimensional array depicting the rows and columns of the table body
        tableBody: kitchenTicket.items.map((product, index) => {
          return [
            {
              type: 'text',
              value: String(index + 1),
              style: { fontWeight: '600', color: '#000' },
            },
            {
              type: 'text',
              value: product.name,
              style: { textAlign: 'left', fontWeight: '600', color: '#000' },
            },
            {
              type: 'text',
              value: String(product.quantity),
              style: { textAlign: 'center', fontWeight: '600', color: '#000' },
            },
          ];
        }),
        // custom style for the table header
        tableHeaderStyle: {},
        // custom style for the table body
        tableBodyStyle: { border: '1px solid #000' },
        // custom style for the table footer
        tableFooterStyle: {},
      },
    ];

    const res = await PosPrinter.print(data, options)
      .then(() => {
        log.info('Print success');
        return true;
      })
      .catch((error) => {
        log.info('Print failed');
        log.info(error);
        console.error(error);
        return false;
      });

    return res;
  } catch (error) {
    log.info('Print failed');
    log.info(error);
    console.log(error);

    return false;
  }
};
