import {
  PosPrintData,
  PosPrintOptions,
  PosPrinter,
} from 'electron-pos-printer';
import moment from 'moment';
import log from 'electron-log';
import { KitchenTicket, PreCheck } from '../../renderer/types/Print';
import { app, BrowserWindow } from 'electron';

const PRINTERS = {
  STATION: 'STATION',
  BAR: 'BAR',
  KITCHEN: 'KITCHEN',
};

const getPrinterNameByCategory = (category: string) => {
  switch (category) {
    case 'ready':
      return PRINTERS.STATION;
    case 'bar':
      return PRINTERS.BAR;
    case 'kitchen':
      return PRINTERS.KITCHEN;
    default:
      return PRINTERS.STATION;
  }
};

export const printKitchenTicket = async (
  kitchenTicket: KitchenTicket,
): Promise<boolean> => {
  try {
    const date = moment().format('DD.MM.YYYY, hh:mm');
    const groupedItems = kitchenTicket.items.reduce(
      (acc, item) => {
        const printer = getPrinterNameByCategory(item.print_category);
        acc[printer] = acc[printer] || [];
        acc[printer].push(item);
        return acc;
      },
      {} as Record<string, KitchenTicket['items']>,
    );

    // const options: PosPrintOptions = {
    //   boolean: false,
    //   // preview: true,
    //   silent: true,
    //   margin: '0 0 0 0',
    //   margins: {
    //     marginType: 'none',
    //   },
    //   copies: 1,
    //   printerName: '',
    //   pageSize: '80mm',
    //   timeOutPerLine: 5000,
    // };

    for (const [printer, items] of Object.entries(groupedItems)) {
      const options: PosPrintOptions = {
        boolean: false,
        silent: true,
        margin: '0 0 0 0',
        margins: {
          marginType: 'none',
        },
        copies: 1,
        printerName: printer,
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
          tableBody: items.map((product, index) => {
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
                style: {
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#000',
                },
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

      try {
        await PosPrinter.print(data, options);
        log.info(`Print success on printer ${printer}`);
      } catch (error) {
        if (
          options.printerName === PRINTERS.BAR ||
          options.printerName === PRINTERS.KITCHEN
        ) {
          await PosPrinter.print(data, {
            ...options,
            printerName: PRINTERS.STATION,
          });
        }
        log.error(`Print failed on printer ${printer}:`, error);
        continue;
      }
      // const res = await PosPrinter.print(data, options)
      //   .then(() => {
      //     log.info('Print success');
      //     return true;
      //   })
      //   .catch((error) => {
      //     log.info('Print failed');
      //     log.info(error);
      //     console.error(error);
      //     return false;
      //   });

      // if (!res) {
      //   return false;
      // }
      // return res;
    }
    return true;
  } catch (error) {
    log.info('Print failed');
    log.info(error);
    console.log(error);

    return false;
  }
};

export const printCheck = async (orderCheck: PreCheck): Promise<boolean> => {
  try {
    const date = moment().format('DD.MM.YYYY, hh:mm');

    const options: PosPrintOptions = {
      boolean: false,
      silent: true,
      margin: '0 0 0 0',
      margins: {
        marginType: 'none',
      },
      copies: 1,
      printerName: PRINTERS.STATION,
      pageSize: '80mm',
      timeOutPerLine: 5000,
    };

    const data: PosPrintData[] = [
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Бариста',
        style: {
          fontWeight: '700',
          textAlign: 'center',
          fontSize: '16px',
          marginBottom: '4px',
        },
      },
      // {
      //   type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
      //   value: `Стол ${orderCheck.table}`,
      //   style: {
      //     fontWeight: '700',
      //     textAlign: 'center',
      //     fontSize: '14px',
      //     marginBottom: '12px',
      //     padding: '0 12px',
      //   },
      // },
      {
        type: 'table',
        // style the table
        style: {
          border: '1px solid transparent',
          color: '#000',
          fontSize: '12px',
          borderCollapse: 'unset',
          marginBottom: '5px',
        },
        // list of the columns to be rendered in the table header
        tableHeader: ['', ''],
        // multi dimensional array depicting the rows and columns of the table body
        tableBody: [
          [
            {
              type: 'text',
              value: 'Стол:',
              style: { textAlign: 'left', fontWeight: '600' },
            },
            {
              type: 'text',
              value: orderCheck.table,
              style: { textAlign: 'right', fontWeight: '600' },
            },
          ],
          [
            {
              type: 'text',
              value: 'Чек:',
              style: { textAlign: 'left', fontWeight: '600' },
            },
            {
              type: 'text',
              value: String(orderCheck.checkId),
              style: { textAlign: 'right', fontWeight: '600' },
            },
          ],
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
          [
            {
              type: 'text',
              value: 'Клиент:',
              style: { textAlign: 'left', fontWeight: '600' },
            },
            {
              type: 'text',
              value: orderCheck.client,
              style: { textAlign: 'right', fontWeight: '600' },
            },
          ],
          [
            {
              type: 'text',
              value: 'Официант:',
              style: { textAlign: 'left', fontWeight: '600' },
            },
            {
              type: 'text',
              value: orderCheck.user,
              style: { textAlign: 'right', fontWeight: '600' },
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
        tableHeader: ['№', 'Наимен.', 'Цена', 'Кол.', 'Сумма'],
        // multi dimensional array depicting the rows and columns of the table body
        tableBody: orderCheck.items.map((item, index) => {
          return [
            {
              type: 'text',
              value: String(index + 1),
              style: { fontWeight: '600', color: '#000' },
            },
            {
              type: 'text',
              value: item.product.name,
              style: { textAlign: 'left', fontWeight: '600', color: '#000' },
            },
            {
              type: 'text',
              value: String(item.product.retprice),
              style: { textAlign: 'right', fontWeight: '600', color: '#000' },
            },
            {
              type: 'text',
              value: String(item.quantity),
              style: { textAlign: 'center', fontWeight: '600', color: '#000' },
            },
            {
              type: 'text',
              value: String(item.totalPrice),
              style: { textAlign: 'right', fontWeight: '600', color: '#000' },
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

      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: `Скидка: ${orderCheck.discount}%`,
        style: {
          fontWeight: '700',
          textAlign: 'right',
          fontSize: '18px',
          marginTop: '8px',
          marginBottom: '12px',
        },
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: `ИТОГО: ${orderCheck.total_amount} тг`,
        style: {
          fontWeight: '700',
          textAlign: 'right',
          fontSize: '18px',
          marginTop: '8px',
          marginBottom: '12px',
        },
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: `ИТОГО СО СКИДКОЙ: ${orderCheck.total_amount - (orderCheck.total_amount / 100) * orderCheck.discount} тг`,
        style: {
          fontWeight: '700',
          textAlign: 'right',
          fontSize: '18px',
          marginTop: '8px',
          marginBottom: '28px',
        },
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
