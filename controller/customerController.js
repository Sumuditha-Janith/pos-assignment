import {customer_db, item_db} from "../db/db.js";
import CustomerModel from "../model/customerModel.js";
import { updateDashboard } from "./dashboardController.js";

let namePattern =/^[A-Za-z\s]{3,40}$/
let addressPattern =/^[a-zA-Z0-9\s,.'-]{5,100}$/
let contactPattern = /^0\d{9}$/;
let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

$(document).ready(function () {
    clear();
});

$("#search-customer").on("input",function () {
    let text = $(this).val()

    $("#table-customer tr").each(function () {
        let search = $(this).text()

        if (search.includes(text)){
            $(this).show()
        }else {
            $(this).hide()
        }
    })
})

export function loadCustomer() {
    $("#customer-tbody").empty();
    customer_db.map((item) => {
        let data = `<tr>
            <td>${item.cusId}</td>
            <td>${item.cusName}</td>
            <td>${item.address}</td>
            <td>${item.contact}</td>
            <td>${item.email}</td>         
        </tr>`;
        $("#customer-tbody").append(data);
    });
}

function nextId() {
    if (customer_db.length === 0) return "CUS001";
    let lastId = customer_db[customer_db.length - 1].cusId;
    let numberPart = Number(lastId.slice(3));
    let nextNumber = numberPart + 1;
    let formatted = String(nextNumber).padStart(3, '0');
    return "CUS" + formatted;
}

export function clear() {
    $("#cusId").val(nextId());
    $('#cusName').val('');
    $('#address').val('');
    $('#contact').val('');
    $('#email').val('');
}

function loadCustomerIds() {
    console.log('Loading customer IDs...');
    $('#customer-dropdown').empty();
    $('#customer-dropdown').append($('<option>', {
        value: '',
        text: 'Select Customer ID'
    }));
    console.log(customer_db);
    customer_db.forEach(customer => {
        $('#customer-dropdown').append(
            $('<option>', {
                value: customer.cusId,
                text: customer.cusId
            })
        );
    });
}

$("#customer-save").click(function () {
    let cusId = nextId();
    let cusName = $("#cusName").val()
    let address = $("#address").val()
    let contact = $("#contact").val()
    let email = $("#email").val();

    if (!contactPattern.test(contact)) {
        Swal.fire({
            title: "Error!",
            text: "Invalid contact format",
            icon: "error",
            confirmButtonText: "Ok"
        });
        return;
    }

    if (!addressPattern.test(address)) {
        Swal.fire({
            title: "Error!",
            text: "Invalid address format",
            icon: "error",
            confirmButtonText: "Ok"
        });
        return;
    }

    if (!namePattern.test(cusName)) {
        Swal.fire({
            title: "Error!",
            text: "Invalid name format",
            icon: "error",
            confirmButtonText: "Ok"
        });
        return;
    }

    if (!emailPattern.test(email)) {
        Swal.fire({
            title: "Error!",
            text: "Invalid email format",
            icon: "error",
            confirmButtonText: "Ok"
        });
        return;
    }

    if (cusName === '' || email === '' || contact === '' || address === '') {
        Swal.fire({
            title: 'Error!',
            text: 'Invalid Inputs',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    let customer_data = new CustomerModel(cusId, cusName, email, contact, address);
    customer_db.push(customer_data);
    loadCustomerIds()
    loadCustomer();

    Swal.fire({
        title: "Added Successfully!",
        icon: "success"
    });
    clear();
    updateDashboard();
});

$('#customer-reset').on('click', function () {
    clear();
    loadCustomer();
    nextId();
});

$('#customer-delete').on('click', function () {
    let cusId = $('#cusId').val()
    let cusName = $('#cusName').val()
    let address = $('#address').val()
    let contact = $('#contact').val()
    let email = $('#email').val()

    if (cusName === '' || email === '' || contact === '' || address === '') {
        Swal.fire({
            title: "Error",
            text: "Select customer",
            icon: "error"
        });
        return;
    }

    let index = customer_db.findIndex(customer => customer.cusId == Number(cusId));

    Swal.fire({
        title: 'Are you sure?',
        text: 'This customer will be removed!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    }).then(result => {
        if (result.isConfirmed) {
            customer_db.splice(index, 1);
            loadCustomer();
            updateDashboard();
            clear();
            loadCustomerIds()
        }
    });
});

$('#customer-update').on('click', function () {
    let cusId = $('#cusId').val()
    let cusName = $('#cusName').val();
    let address = $('#address').val()
    let contact = $('#contact').val();
    let email = $('#email').val();

    if (!contactPattern.test(contact)) {
        Swal.fire({
            title: "Error!",
            text: "Invalid contact format",
            icon: "error",
            confirmButtonText: "Ok"
        });
        return;
    }

    if (!addressPattern.test(address)) {
        Swal.fire({
            title: "Error!",
            text: "Invalid address format",
            icon: "error",
            confirmButtonText: "Ok"
        });
        return;
    }

    if (!namePattern.test(cusName)) {
        Swal.fire({
            title: "Error!",
            text: "Invalid name format",
            icon: "error",
            confirmButtonText: "Ok"
        });
        return;
    }

    if (!emailPattern.test(email)) {
        Swal.fire({
            title: "Error!",
            text: "Invalid email format",
            icon: "error",
            confirmButtonText: "Ok"
        });
        return;
    }

    if (cusId === '' || cusName === '' || email === '' || contact === '' || address === '') {
        Swal.fire({
            title: "Error",
            text: "Fill the fields first",
            icon: "error"
        });
        return
    }

    let index = customer_db.findIndex(customer => customer.cusId == Number(cusId));

    customer_db[index] = new CustomerModel(cusId, cusName, email, contact, address);

    loadCustomer();

    Swal.fire({
        title: "Updated!",
        text: "Customer Updated Successfully!",
        icon: "success"
    });
    updateDashboard();
    clear();
});

$("#customer-tbody").on('click', 'tr', function () {
    let index = $(this).index();
    let customer = customer_db[index];

    $('#cusId').val(customer.cusId);
    $('#cusName').val(customer.cusName);
    $('#address').val(customer.address);
    $('#contact').val(customer.contact);
    $('#email').val(customer.email);
});