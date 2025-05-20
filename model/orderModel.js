export class orderModel {
    constructor(orderId, customerId, date, items, totalAmount) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.date = date;
        this.items = items;
        this.totalAmount = totalAmount;
    }
}