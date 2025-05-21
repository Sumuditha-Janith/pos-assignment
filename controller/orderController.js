import { customer_db, item_db, order_db } from "../db/db.js";
import { loadItems, loadItemsId } from './itemController.js';
import { updateDashboard } from "./dashboardController.js";

let cart_db = [];

$(document).ready(function () {
    clearForm();
    loadItemsId();
});

function nextOrderId() {
    if (order_db.length === 0) return "ORD001";
    let lastOrderId = order_db[order_db.length - 1].orderId;
    let numberPart = Number(lastOrderId.slice(3));
    let nextNumber = numberPart + 1;
    let formattedNumber = String(nextNumber).padStart(3, '0');
    return "ORD" + formattedNumber;
}

function clearForm() {
    $('#order-id').val(nextOrderId());
    $('#cash').val('');
    $('#discount').val('');
    $('#balance').val('');
    $('#order-qty').val('');
    $('#item-price').val('');
    $('#available-qty').val('');
    $('#discounted-price').val('');
    $('#item-dropdown').prop('selectedIndex', 0);
    $('#customer-dropdown').prop('selectedIndex', 0);
}

$('#item-dropdown').change(function() {
    updateAvailableQuantity();
});

function updateAvailableQuantity() {
    let itemId = $('#item-dropdown').val();
    if (itemId) {
        let selectedItem = item_db.find(item => item.itemId === itemId);
        if (selectedItem) {
            $('#available-qty').val(selectedItem.qty);
        } else {
            $('#available-qty').val('');
        }
    } else {
        $('#available-qty').val('');
    }
}

$('#cash, #discount').on('input', function () {
    updateBalance();
    updateDiscountedPrice();
});

function updateBalance() {
    let cashInput = $('#cash').val().trim();

    if (cashInput === '') {
        $('#balance').val('');
        return;
    }

    let cash = Number(cashInput);
    let discount = Number($('#discount').val());
    let total = Number($('#item-price').val());

    if (isNaN(discount)) discount = 0;
    if (isNaN(total)) total = 0;

    let discountAmount = total * discount / 100;
    let finalAmount = total - discountAmount;
    let balance = cash - finalAmount;

    $('#balance').val(balance.toFixed(2));
}

function updateDiscountedPrice() {
    let total = Number($('#item-price').val());
    let discount = Number($('#discount').val());

    if (isNaN(total)) total = 0;
    if (isNaN(discount)) discount = 0;

    let discountAmount = total * discount / 100;
    let finalAmount = total - discountAmount;

    $('#discounted-price').val(finalAmount.toFixed(2));
}

$('#add-cart').click(function () {
    let orderId = $('#order-id').val();
    let itemId = $('#item-dropdown').val();
    let qty = Number($('#order-qty').val());
    let date = new Date().toLocaleDateString();

    let selectedItem = null;
    for (let i = 0; i < item_db.length; i++) {
        if (item_db[i].itemId.toString() === itemId) {
            selectedItem = item_db[i];
            break;
        }
    }

    if (!selectedItem || qty <= 0 || selectedItem.qty < qty) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops!',
            text: 'Please check qty is low'
        });
        return;
    }

    let itemTotal = selectedItem.price * qty;

    let found = false;
    for (let i = 0; i < cart_db.length; i++) {
        if (cart_db[i].itemId === itemId) {
            if (selectedItem.qty < cart_db[i].qty + qty) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Not enough stock',
                    text: 'There is not enough stock to add this quantity.'
                });
                return;
            }

            cart_db[i].qty += qty;
            cart_db[i].amount += itemTotal;

            let row = $(`#order-tbody tr[data-id="${itemId}"]`);
            row.find('td:eq(1)').text(cart_db[i].qty);
            row.find('td:eq(2)').text(cart_db[i].amount.toFixed(2));
            found = true;
            break;
        }
    }

    if (!found) {
        let cartItem = {
            orderId: orderId,
            itemId: itemId,
            qty: qty,
            amount: itemTotal,
            date: date
        };
        cart_db.push(cartItem);

        $('#order-tbody').append(`
            <tr data-id="${itemId}">
                <td>${itemId}</td>
                <td>${qty}</td>
                <td>${itemTotal.toFixed(2)}</td>
                <td>${date}</td>
                <td><button class="btn btn-sm btn-danger remove-btn">Remove</button></td>
            </tr>
        `);
    }

    let currentTotal = Number($('#item-price').val());
    if (isNaN(currentTotal)) currentTotal = 0;
    $('#item-price').val((currentTotal + itemTotal).toFixed(2));

    if (selectedItem) {
        $('#available-qty').val(selectedItem.qty - qty);
    }

    Swal.fire({
        icon: 'success',
        title: 'Added to Cart',
        text: 'The item added successfully '
    });

    $('#order-qty').val('');
    $('#available-qty').val('');
    $('#item-dropdown').prop('selectedIndex', 0);

    updateBalance();
    updateDiscountedPrice();
    loadItems();
});

$('#order-tbody').on('click', '.remove-btn', function () {
    let row = $(this).closest('tr');
    let itemId = row.data('id').toString();

    for (let i = 0; i < cart_db.length; i++) {
        if (cart_db[i].itemId === itemId) {
            let removedItem = cart_db[i];
            cart_db.splice(i, 1);

            let currentTotal = Number($('#item-price').val());
            let newTotal = currentTotal - removedItem.amount;
            $('#item-price').val(newTotal.toFixed(2));

            row.remove();

            let currentItemId = $('#item-dropdown').val();
            if (currentItemId) {
                let selectedItem = item_db.find(item => item.itemId === currentItemId);
                if (selectedItem) {
                    $('#available-qty').val(selectedItem.qty);
                }
            }

            updateBalance();
            updateDiscountedPrice();
            loadItems();
            break;
        }
    }
});

$('#process-btn').click(function () {
    let orderId = $('#order-id').val();
    let customerId = $('#customer-dropdown').val();
    let date = new Date().toLocaleDateString();
    let balance = Number($('#balance').val());

    if (!customerId || cart_db.length === 0 || isNaN(balance) || balance < 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Please Check',
            text: 'invalid input found'
        });
        return;
    }

    let orderItems = [];
    let totalAmount = 0;

    for (let i = 0; i < cart_db.length; i++) {
        let cartItem = cart_db[i];
        totalAmount += cartItem.amount;

        for (let j = 0; j < item_db.length; j++) {
            if (item_db[j].itemId.toString() === cartItem.itemId) {
                item_db[j].qty -= cartItem.qty;
                break;
            }
        }

        orderItems.push({
            itemId: cartItem.itemId,
            qty: cartItem.qty,
            amount: cartItem.amount
        });
    }

    order_db.push({
        orderId: Number(orderId),
        customerId: customerId,
        date: date,
        items: orderItems,
        totalAmount: totalAmount
    });

    $('#order-tbody').empty();
    let total = $('#item-price').val();
    $('#item-price').val('');
    cart_db = [];

    Swal.fire({
        title: 'Order Saved',
        text: 'Processed Successfully!',
        icon: 'success',
        showCancelButton: false,
        confirmButtonText: 'Okay',
    }).then((result) => {
        if (result.isConfirmed) {

            $('#discount').val('');
            $('#discounted-price').val('');
            $('#cash').val('');
            $('#balance').val('');

            updateDashboard();
            clearForm();
        }
    });

    $('#history-tbody').append(`
        <tr>
            <td>${orderId}</td>
            <td>${customerId}</td>
            <td>${date}</td>
            <td>${totalAmount.toFixed(2)}</td>
        </tr>
    `);

    clearForm();
    loadItems();
});