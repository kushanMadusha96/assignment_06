export class OrderDetail {
    constructor(date, customer_id, order_id, items, total) {
        this.date = date;
        this.customer_id = customer_id;
        this.order_id = order_id;
        this.items = items;
        this.total = total;
    }
}