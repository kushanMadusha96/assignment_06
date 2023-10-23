export const item_db = [];

//item model
class ItemModel {
    constructor(item_id, item_name, price, qty) {
        this.item_id = item_id;
        this.item_name = item_name;
        this.price = price;
        this.qty = qty;
    }
}

//item id make read only
$(document).ready(function () {
    function itemIdMakeReadonly() {
        $("#item_id").prop("readonly",true);
        $("#item-id-u").prop("readonly",true);
    }
    itemIdMakeReadonly();
    setInterval(itemIdMakeReadonly,1000);
})

//clear update inputs
function clearUpdateInputs() {
    $("#item-id-u").val("");
    $("#item-name-u").val("");
    $("#price-u").val("");
    $("#qty-u").val("");
};

//clear add inputs
function clearAddInputs() {
    $("#item_id").val("");
    $("#item-name").val("");
    $("#price").val("");
    $("#qty").val("");
};

//load all item to table
function loadAll() {
    $("#i-table-body").empty();
    item_db.map((item, index) => {
        let item_row = `<tr><td class="item-id">${item.item_id}</td><td class="item-name">${item.item_name}</td><td class="price">${item.price}</td><td class="qty">${item.qty}</td></tr>`;
        $("#i-table-body").append(item_row);
    })
}

//error alert
function showError(message) {
    Swal.fire({
        icon: 'error',
        text: message,
    });
}

const namePattern = /^[A-Za-z\s\-']+$/;
const nameLengthPattern = /^[A-Za-z\s\-']{3,15}$/;
const pricePattern = /^\d+(\.\d{2})?$/;
var quantityPattern = /^\d+$/;

//save item
$("#i-add-btn").on('click', async () => {
    if (!$("#item_id").val() || !$("#item-name").val() || !$("#price").val() || !$("#qty").val()) {
        showError("Please fill in all fields correctly.");
        return;
    }

    if (!namePattern.test($("#item-name").val())) {
        showError("Name must start with a letter and can only include letters, hyphens, and apostrophes.");
        return;
    }

    if (!nameLengthPattern.test($("#item-name").val())) {
        showError("Name must be 3 to 15 characters long.");
        return;
    }

    if (!pricePattern.test($("#price").val())) {
        showError("invalid price, Enter only numbers.( maximum 2 cents )");
        return;
    }

    if (!quantityPattern.test($("#qty").val())) {
        showError("Invalid quantity, Enter only whole numbers");
        return;
    }

    item_db.push(new ItemModel($("#item_id").val(), $("#item-name").val(), $("#price").val(), $("#qty").val()));
    await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'item saved successfully',
        showConfirmButton: false,
        timer: 1500
    });
    await loadAll();
    await clearAddInputs();
    await generateNextItemId();
});

//clicked raw set to input fields
let item_id;
$("#i-table-body").on('click', 'tr', function () {
    $("#item-id-u").val($(this).find(".item-id").text());
    $("#item-name-u").val($(this).find(".item-name").text());
    $("#price-u").val($(this).find(".price").text());
    $("#qty-u").val($(this).find(".qty").text());
    item_id = $(this).find(".item-id").text();
});

//update item
$("#i-update-btn").on('click', async () => {
    if (!$("#item-id-u").val() || !$("#item-name-u").val() || !$("#price-u").val() || !$("#qty-u").val()) {
        showError("Please fill in all fields correctly.");
        return;
    }

    if (!namePattern.test($("#item-name-u").val())) {
        showError("Name must start with a letter and can only include letters, hyphens, and apostrophes.");
        return;
    }

    if (!nameLengthPattern.test($("#item-name-u").val())) {
        showError("Name must be 3 to 15 characters long.");
        return;
    }

    if (!pricePattern.test($("#price-u").val())) {
        showError("invalid price, Enter only numbers.( maximum 2 cents )");
        return;
    }

    if (!quantityPattern.test($("#qty-u").val())) {
        showError("Invalid quantity, Enter only whole numbers");
        return;
    }

    item_db[item_db.findIndex(item => item.item_id === $("#item-id-u").val())] =  new ItemModel($("#item-id-u").val(), $("#item-name-u").val(),$("#price-u").val(), $("#qty-u").val());

    await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'item updated successfully',
        showConfirmButton: false,
        timer: 1500
    });

    await loadAll();
    await clearUpdateInputs();
});

//remove item
$("#item-crudButtons>button[type='button']").eq(2).on('click', () => {
    item_db.splice(item_db.findIndex(item => item.item_id === item_id), 1);
    loadAll();
});

//load all data
$("#item-crudButtons>button[type='button']").eq(3).on('click', () => {
    // loadAll();
});

//generate next item id
function generateNextItemId() {
    $("#item_id").val("I00"+(item_db.length + 1));
}

//generate next item id when click register button
$("#item-crudButtons>button").eq(0).on('click', () => {
    generateNextItemId();
});

//search item
$("#search-input").on("input", function () {
    $("#i-table-body").empty();
    item_db.map((item, index) => {
        if(item.item_id.toLowerCase().startsWith($("#search-input").val().toLowerCase()) || item.item_name.toLowerCase().startsWith($("#search-input").val().toLowerCase())) {
            $("#i-table-body").append(`<tr><td class="item-id">${item.item_id}</td><td class="item-name">${item.item_name}</td><td class="price">${item.price}</td><td class="qty">${item.qty}</td></tr>`);
        }
    })
});