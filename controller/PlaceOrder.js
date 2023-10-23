import {customer_db} from "../controller/CustomerController.js";
import {item_db} from "./ItemController.js";
const db = [];
export const order_detail_db = [];

//regex patterns
const quantityPattern = /^\d+$/;

//error alert
function showError(message) {
    Swal.fire({
        icon: 'error',
        text: message,
    });
}

//realtime date date input
$(document).ready(function () {
    function updateDateTime() {
        var now = new Date();
        var dateTimeString = now.toLocaleString();
        $("#date").val(dateTimeString);
        $("#po-customer-id").prop("readonly", true);
        $("#order-id").prop("readonly", true);
        $("#date").prop("readonly", true);
        $("#po-item-id").prop("readonly", true);
        $("#po-item-name").prop("readonly", true);
        $("#po-price").prop("readonly", true);
        $("#qty-on-hand").prop("readonly", true);
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

//order raw model
class OrderRaw {
    constructor(customer_id, order_id, date, item_id, item_name, price, qty) {
        this.customer_id = customer_id;
        this.order_id = order_id;
        this.date = date;
        this.item_id = item_id;
        this.item_name = item_name;
        this.price = price;
        this.qty = qty;
    }
}

// load all orders to table => ( place order )
function loadAll() {
        let total = 0.0;
        $("#po-table-body").empty();
        db.map((item, index) => {
            $("#po-table-body").append(`<tr><td class="customer-id">${item.customer_id}</td><td class="order-id">${item.order_id}</td><td class="date">${item.date}</td><td class="item-id">${item.item_id}</td><td class="item-name">${item.item_name}</td><td class="price">${item.price}</td><td class="qty">${item.qty}</td></tr>`);
            $("#total-lbl").text(total = parseFloat(total) + (parseFloat(item.price) * parseFloat(item.qty)));
        });
    };

// clear inputs
function clearInputs() {
        $("#po-item-id").val(""),
        $("#po-item-name").val(""),
        $("#po-price").val(""),
        $("#qty-on-hand").val(""),
        $("#po-qty").val("")
}

//check buying qty is have in stock
function checkBuyingQty() {
    let on_hand_qty = parseInt($("#qty-on-hand").val());
    let buying_qty = parseInt($("#po-qty").val());

    if (isNaN(on_hand_qty) || isNaN(buying_qty)) {
        return false; // Handle non-numeric input
    }

    if (buying_qty < 1) {
        return false; // Buying quantity is less than 1
    }

    if (buying_qty > on_hand_qty) {
        return false; // Buying quantity is greater than on-hand quantity
    }

    return true; // Buying quantity is within the acceptable range
}

//change color in qty input for wrong values
let on_hand_qty = parseInt($("#qty-on-hand").val());

$("#po-qty").on('input', function () {
    let buying_qty = parseInt($("#po-qty").val());

    if (buying_qty < 1 || buying_qty > on_hand_qty) {
        $("#po-qty").css("border", "1px solid red");
    } else {
        $("#po-qty").css("border", "none");
    }
});

//add new order raw
let buying_item_id;
let buying_qty;
$("#add-row").on('click', () => {
    if(!$("#po-customer-id").val() ||  !$("#order-id").val() || !$("#date").val() || !$("#po-item-id").val() || !$("#po-item-name").val() ||  !$("#po-price").val() ||  !$("#po-qty").val()) {
        showError("Fill input correctly!");
        return;
    }

    if (!quantityPattern.test($("#po-qty").val())) {
        showError("Invalid quantity! Enter only whole numbers...");
        return;
    }

    if(!checkBuyingQty()) {
        $("#po-qty").css("border","2px solid red");
        showError("not valid qty..");
        return;
    }

    let isBuying = isAlreadyBuying($("#po-item-name").val(),  $("#po-qty").val());
    if (!isBuying) {
        db.push(new OrderRaw(
            $("#po-customer-id").val(),
            $("#order-id").val(),
            $("#date").val(),
            $("#po-item-id").val(),
            $("#po-item-name").val(),
            $("#po-price").val(),
            $("#po-qty").val()
        ));
    }
    buying_item_id = $("#po-item-id").val();
    buying_qty = $("#po-qty").val();

    loadAll();
    clearInputs()
    reduce_item_count();
});

//reduce item count
function reduce_item_count() {
    let index = item_db.findIndex(item => item.item_id === buying_item_id);
    item_db[index].qty = parseInt(item_db[index].qty) - parseInt(buying_qty);
}

//add item for all ready buying item
function isAlreadyBuying(item_name, new_qty) {
    for(let i = 0; i < db.length; i++ ){
        if(db[i].item_name === item_name) {
            db[i].qty = parseInt(db[i].qty) + (parseInt(new_qty));
            return true;
        }
    }
    return false;
}

//click raw to inputs
let item_id;
$("#po-table-body").on("click", ("tr"), function () {
    $("#po-customer-id").val($(this).find(".customer-id").text());
    $("#order-id").val($(this).find(".order-id").text());
    $("#date").val($(this).find(".date").text());
    $("#po-item-id").val($(this).find(".item-id").text());
    $("#po-item-name").val($(this).find(".item-name").text());
    $("#po-price").val($(this).find(".price").text());
    $("#po-qty").val($(this).find(".qty").text());
    $("#qty-on-hand").val($(this).find(".qty").text())
    item_id = $(this).find(".item-id").text();
});

// update raw data
$("#update-raw").on('click', async () => {
    if(!$("#po-customer-id").val() ||  !$("#order-id").val() || !$("#date").val() || !$("#po-item-id").val() || !$("#po-item-name").val() ||  !$("#po-price").val() ||  !$("#po-qty").val()) {
        showError("Fill input correctly!");
        return;
    }

    if (!quantityPattern.test($("#po-qty").val())) {
        showError("Invalid quantity! Enter only whole numbers...");
        return;
    }

    if(!checkBuyingQty()) {
        $("#po-qty").css("border","2px solid red");
        showError("not valid qty..");
        return;
    }

    if (!quantityPattern.test($("#po-qty").val())) {
        showError("Invalid quantity, Enter only whole numbers");
        return;
    }
    db[db.findIndex(item => item.item_id === item_id)] = new OrderRaw(
            $("#po-customer-id").val(),
            $("#order-id").val(),
            $("#date").val(),
            $("#po-item-id").val(),
            $("#po-item-name").val(),
            $("#po-price").val(),
            $("#po-qty").val()
        );
     await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'raw updated successfully',
        showConfirmButton: false,
        timer: 1500
    });

     await loadAll();
});

//remove item raw
$("#remove-row").on('click', () => {
    db.splice(db.findIndex(item => item.item_id === item_id), 1);
    loadAll()
    clearInputs();
});

// order details for table (save order details)
const items = [];

class OrderDetail {
    constructor(date, customer_id, order_id, items, total) {
        this.date = date;
        this.customer_id = customer_id;
        this.order_id = order_id;
        this.items = items;
        this.total = total;
    }
}
$("#place-order").on('click', async () => {
    $("#po-table-body tr").each(function() {
            items.push($(this).find(".item-name").text());
    });

    order_detail_db.push(new OrderDetail($("#date").val(), $("#po-customer-id").val(), $("#order-id").val(), items.join(","), $("#total-lbl").text()));

   load_all_order_details();

    await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'place order successfully',
        showConfirmButton: false,
        timer: 1500
    });
    await $("#po-table-body").empty();
    items.length = 0;
    db.length = 0;
    $("#po-customer-id").val("");
    await generateNextOrderId();
    clearInputs();
    $("#po-customer-id").val("");
});

//load all order details
function load_all_order_details() {
    $("#od-table-body").empty();
    order_detail_db.map((item, index) => {
        $("#od-table-body").append(`<tr><td>${item.date}</td><td>${item.customer_id}</td><td class="orderId">${item.order_id}</td><td>${item.items}</td><td>${item.total}</td></tr>`);
    });
}

// select value to dropbox (customer or item)
let selectedValue;
$(document).ready(function() {
    $('#dropdown-menu li').click(function() {
        selectedValue = $(this).text();
        $("#dropdown-btn").text(selectedValue);

        $('#search-input').val('');

        if(selectedValue === "by customer") {
            customer_db.map((item, index) => {
                $("#values").append(`<option value="${item.nic}"></option>`)
            })
        }else {
            $("#search-dropbox").text("items");
            item_db.map((item, index) => {
                $("#values").append(`<option value="${item.item_name}"></option>`)
            })
        }
    });
});

//search value to fields
$("#search-input").on("keypress", function (e) {
    let key = e.which;
    if(key == 13) {
        if(selectedValue === "by customer") {
            if ($("#po-table-body tr").length === 0) {
                $("#po-customer-id").val(customer_db[customer_db.findIndex((item) => item.nic === $("#search-input").val())].customer_id);
            }else {
                showError("please finish current order before make new order");
            }
        }else {
            if(selectedValue === "by item") {
                let selected_item_index = item_db.findIndex((item) => item.item_name === $("#search-input").val());
                $("#po-item-id").val(item_db[selected_item_index].item_id);
                $("#po-item-name").val(item_db[selected_item_index].item_name);
                $("#po-price").val(item_db[selected_item_index].price);
                $("#qty-on-hand").val(item_db[selected_item_index].qty);
            }
        }
    }
});

//generate next order-id
function generateNextOrderId() {
    $("#order-id").val("O00"+(order_detail_db.length + 1));
}
generateNextOrderId();