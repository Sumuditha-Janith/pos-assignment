import { customer_db, item_db, order_db } from "../db/db.js";

export function updateDashboard() {
    $("#total-customers").text(customer_db.length);

    $("#total-products").text(item_db.length);

    $("#total-orders").text(order_db.length);

    let totalRevenue = order_db.reduce((acc, order) => acc + order.totalAmount, 0);
    $("#total-revenue").text(totalRevenue.toFixed(2));
}
