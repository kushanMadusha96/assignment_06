// customer db
import {CustomerModel} from "../model/CustomerModel.js";
export const customer_db = [];

//customer id make read only
$(document).ready(function () {
    function customerIdMakeReadonly() {
        $("#customer_id").prop("readonly",true);
        $("#customer-id-u").prop("readonly",true);
    }
    customerIdMakeReadonly();
    setInterval(customerIdMakeReadonly,1000);
})

// clear inputs
function clearAddInputs() {
    $("#customer_id").val("");
    $("#customer_name").val("");
    $("#customer-nic").val("");
    $("#contact").val("");
}

//clear update inputs
function clearUpdateInputs() {
    $("#customer-id-u").val("");
    $("#customer-name-u").val("");
    $("#customer-nic-u").val("");
    $("#contact-u").val("");
}

// load all customers to table
function loadAll() {
    $("#c-tbl-body").empty();
    customer_db.map((item, index) => {
        let customer =
            `<tr><td class="customer-id">${item.customer_id}</td><td class="customer-name">${item.customer_name}</td><td class="nic">${item.nic}</td><td class="contact">${item.contact}</td></td></tr>`
        $("#c-tbl-body").append(customer);
    })
}

//regex pattern
const namePattern = /^[A-Za-z\s\-']+$/;
const nameLengthPattern = /^[A-Za-z\s\-']{3,20}$/;
const nicPattern = /^\d{12}(v)?$/;
const phoneNumberPattern = /^(?:\+1)?\d{10}$/;

//error alert
function showError(message) {
    Swal.fire({
        icon: 'error',
        text: message,
    });
}

//save customer
$("#c-add_btn").on('click', async () => {
    const customerId = $("#customer_id").val();
    const customerName = $("#customer_name").val();
    const customerNic = $("#customer-nic").val();
    const contact = $("#contact").val();

    if (!customerId || !customerName || !customerNic || !contact) {
        showError("Please fill in all fields correctly.");
        return;
    }

    if (!namePattern.test(customerName)) {
        showError("Name must start with a letter and can only include letters, hyphens, and apostrophes.");
        return;
    }

    if (!nameLengthPattern.test(customerName)) {
        showError("Name must be 3 to 20 characters long.");
        return;
    }

    if (!nicPattern.test(customerNic)) {
        showError("Enter a valid NIC number (e.g., 200224000741 or 200224000741v).");
        return;
    }

    if (!phoneNumberPattern.test(contact)) {
        showError("Enter a valid phone number (e.g., 0772461021).");
        return;
    }

    customer_db.push(new CustomerModel(customerId, customerName, customerNic, contact));

    await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Customer saved successfully',
        showConfirmButton: false,
        timer: 1500,

    });

    await clearAddInputs();
    await loadAll();
    await generateNextCustomerId();
});

// clicked raw set to input fields
let cus_id;
$("#c-tbl-body").on('click', ("tr"), function () {
    $("#customer-id-u").val($(this).find(".customer-id").text());
    $("#customer-name-u").val($(this).find(".customer-name").text());
    $("#customer-nic-u").val($(this).find(".nic").text());
    $("#contact-u").val($(this).find(".contact").text());
    cus_id = $(this).find(".customer-id").text();
});

//update customer
$("#c-update-btn").on('click', () => {
    const customer_id = $("#customer-id-u").val();
    const customer_name = $("#customer-name-u").val();
    const customer_nic = $("#customer-nic-u").val();
    const contact = $("#contact-u").val();

    if (!customer_id || !customer_name || !customer_nic || !contact) {
        showError("Please fill in all fields correctly.");
        return;
    }

    if (!namePattern.test(customer_name)) {
        showError("Name must start with a letter and can only include letters, hyphens, and apostrophes.");
        return;
    }

    if (!nameLengthPattern.test(customer_name)) {
        showError("Name must be 3 to 20 characters long.");
        return;
    }

    if (!nicPattern.test(customer_nic)) {
        showError("Enter a valid NIC number (e.g., 200224000741 or 200224000741v).");
        return;
    }

    if (!phoneNumberPattern.test(contact)) {
        showError("Enter a valid phone number (e.g., 0772461021).");
        return;
    }
    customer_db[customer_db.findIndex(item => item.customer_id === customer_id)] = new CustomerModel(customer_id, customer_name, customer_nic, contact);
    Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Customer updated successfully',
        showConfirmButton: false,
        timer: 1500,
    });
    loadAll();
    clearUpdateInputs()
});

// delete customer
$("#c-crudButtons>button[type='button']").eq(2).on('click', () => {
    customer_db.splice(customer_db.findIndex(item => item.customer_id === cus_id), 1);
    loadAll();
});

// see all customer
$("#c-crudButtons>button[type='button']").eq(3).on('click', () => {
    // loadAll();
});

//generate next customer id
function generateNextCustomerId() {
    $("#customer_id").val("C00"+(customer_db.length + 1));
}

//generate next customer id when click register button
$("#c-crudButtons>button").eq(0).on('click', () => {
    generateNextCustomerId();
});

//search customer
$("#search-input").on("input", function () {
    $("#c-tbl-body").empty();
    customer_db.map((item, index) => {
        if(item.customer_id.toLowerCase().startsWith($("#search-input").val().toLowerCase()) || item.customer_name.toLowerCase().startsWith($("#search-input").val().toLowerCase()) || item.nic.toLowerCase().startsWith($("#search-input").val().toLowerCase())) {
            $("#c-tbl-body").append(`<tr><td class="customer-id">${item.customer_id}</td><td class="customer-name">${item.customer_name}</td><td class="nic">${item.nic}</td><td class="contact">${item.contact}</td></td></tr>`);
        }
    })
});
