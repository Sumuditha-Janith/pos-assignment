import {customer_db, item_db} from "../db/db.js";
import itemModel from "../model/itemModel.js";
import { updateDashboard } from "./dashboardController.js";

let itemNameRegex = /^[A-Za-z0-9 .]+$/;
let qtyRegex = /^([1-9][0-9]*|0)(\.[0-9]+)?$/;
let priceRegex = /^\d+(\.\d{2})?$/;

$(document).ready(function () {
    loadItemsId()
    loadItems();
    clear();
});

export function loadItems() {
    $("#item-tbody").empty();
    item_db.map((item) => {
        let data = `<tr>
            <td>${item.itemId}</td>
            <td>${item.itemName}</td>
            <td>${item.qty}</td>
            <td>${item.price}</td>         
        </tr>`;
        $("#item-tbody").append(data);
    });
}

function nextId() {
    if (item_db.length === 0) return "ITM001";
    let lastItemId = item_db[item_db.length - 1].itemId;
    let numberPart = Number(lastItemId.slice(3));
    let nextNumber = numberPart + 1;
    let formattedNumber = String(nextNumber).padStart(3, '0');
    return "ITM" + formattedNumber;
}


$("#search-item").on("input", function () {
    let text = $(this).val();

    $("#item-table tr").each(function () {
        let search = $(this).text();

        if (search.includes(text)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
});

export function loadItemsId() {
    $('#item-dropdown').empty();
    $('#item-dropdown').append($('<option>', {
        value: '',
        text: 'Select item ID'
    }));
    item_db.forEach(item => {
        $('#item-dropdown').append(
            $('<option>', {
                value: item.itemId,
                text: item.itemId
            })
        );
    });
}

export function clear() {
    $("#itemId").val(nextId());
    $("#itemName").val("");
    $("#qty").val("");
    $("#price").val("");
}

$("#item-save").click(function () {
    let itemId = nextId();
    let itemName = $("#itemName").val();
    let qty = $("#qty").val();
    let price = $("#price").val();

    if (itemName === '' || qty === '' || price === '') {
        Swal.fire({
            title: 'Error!',
            text: 'Invalid Inputs',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    if (!itemNameRegex.test(itemName)) {
        Swal.fire({
            title: 'Error!',
            text: 'Item name not correct',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    if (!qtyRegex.test(qty)) {
        Swal.fire({
            title: 'Error!',
            text: 'Quantity not correct',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    if (!priceRegex.test(price)) {
        Swal.fire({
            title: 'Error!',
            text: 'Price not correct',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    let itemData = new itemModel(itemId, itemName, qty, price);
    item_db.push(itemData);
    loadItems();
    loadItemsId()
    updateDashboard();
    clear();

    Swal.fire({
        title: "Added Successfully!",
        icon: "success"
    });
});

$("#item-reset").click(function () {
    clear();
});

$("#item-tbody").on('click', 'tr', function () {
    let index = $(this).index();
    let item = item_db[index];

    $("#itemId").val(item.itemId);
    $("#itemName").val(item.itemName);
    $("#qty").val(item.qty);
    $("#price").val(item.price);
});

$("#item-update").click(function () {
    let itemId = $("#itemId").val();
    let itemName = $("#itemName").val();
    let qty = $("#qty").val();
    let price = $("#price").val();

    if (itemName === '' || qty === '' || price === '') {
        Swal.fire({
            title: 'Error!',
            text: 'Invalid Inputs',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    let index = item_db.findIndex(item => item.itemId == itemId);

    if (index === -1) {
        Swal.fire({
            title: "Error",
            text: "Item not found to update",
            icon: "error"
        });
        return;
    }

    if (!itemNameRegex.test(itemName)) {
        Swal.fire({
            title: 'Error!',
            text: 'Item name not correct',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    if (!qtyRegex.test(qty)) {
        Swal.fire({
            title: 'Error!',
            text: 'Quantity not correct',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    if (!priceRegex.test(price)) {
        Swal.fire({
            title: 'Error!',
            text: 'Price not correct',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    item_db[index] = new itemModel(itemId, itemName, qty, price);
    loadItems();
    updateDashboard();
    clear()

    Swal.fire({
        title: "Update success!",
        icon: "success"
    });
});

$("#item-delete").click(function () {
    let itemId = $("#itemId").val();
    let itemName = $("#itemName").val();
    let qty = $("#qty").val();
    let price = $("#price").val();

    if (itemName === '' || qty === '' || price === '') {
        Swal.fire({
            title: 'Error!',
            text: 'Invalid Inputs',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    let index = item_db.findIndex(item => item.itemId == itemId);

    if (index === -1) {
        Swal.fire({
            title: "Error",
            text: "Item not found to delete",
            icon: "error"
        });
        return;
    }

    Swal.fire({
        title: 'Are you sure?',
        text: 'This item will be removed!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    }).then(result => {
        if (result.isConfirmed) {
            item_db.splice(index, 1);
            loadItems();
            clear();
            loadItemsId()
            updateDashboard();
        }
    });
});