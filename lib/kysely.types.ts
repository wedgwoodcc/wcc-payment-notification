import { Generated, ColumnType } from 'kysely';

export interface PaypalNotificationTable {
    id: Generated<number>;
    body: string;
    received_on: ColumnType<Date, string, never>;
}

export interface Database {
    paypal_notification: PaypalNotificationTable;
}