import {order_detail_db} from "../db/order_detail_db.js";
import {item_db} from "../db/item_db.js";
import {customer_db} from "../db/customer_db.js";
import {order_raw_db} from "../db/order_raw_db.js";
import {OrderDetail} from "../model/OrderDetailModel.js";

//regex patterns
const quantityPattern = /^\d+$/;

generateNextOrderId();
// check_table();
setInterval(check_table, 1000);

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
        $("#p-total").prop("readonly", true);
        $("#balance").prop("readonly", true);
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
        order_raw_db.map((item, index) => {
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
        order_raw_db.push(new OrderRaw(
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
    for(let i = 0; i < order_raw_db.length; i++ ){
        if(order_raw_db[i].item_name === item_name) {
            order_raw_db[i].qty = parseInt(order_raw_db[i].qty) + (parseInt(new_qty));
            return true;
        }
    }
    return false;
}

//click raw to inputs
let item_id;
let qty;
let total;
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
    qty = $(this).find(".qty").text();
    total = $("#total-lbl").text();

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
    order_raw_db[order_raw_db.findIndex(item => item.item_id === item_id)] = new OrderRaw(
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
    order_raw_db.splice(order_raw_db.findIndex(item => item.item_id === item_id), 1);

    let index = item_db.findIndex(item => item.item_id === item_id);
    item_db[index].qty = parseInt(item_db[index].qty) + parseInt(qty);
    $("#total-lbl").text(parseFloat($("#total-lbl").text()) - (parseFloat(item_db[index].price) * parseInt(buying_qty)));
    loadAll()
    clearInputs();
});

// order details for table (save order details)
const items = [];

$("#place-order").on('click', async () => {
    console.log("cash :"+ $("#cash").val() + "total :" + $("#p-total").val);
    if(parseFloat($("#p-total").val()) > parseFloat($("#cash").val())) {
        showError("not enough money for order...");
        return;
    }
    if(!$("#balance").val()) {
        showError("please show balance before purchase...");
        return;
    }
    $("#po-table-body tr").each(function() {
            items.push($(this).find(".item-name").text());
    });

    order_detail_db.push(new OrderDetail($("#date").val(), $("#po-customer-id").val(), $("#order-id").val(), items.join(","), $("#p-total").val()));

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
    order_raw_db.length = 0;
    await generateNextOrderId();
    clear_inputs_after_order();
});

//clear inputs after place order
function clear_inputs_after_order() {
    clearInputs()
    $("#po-customer-id").val("");
    $("#total-lbl").text("");
    $("#p-total").val("");
    $("#discount").val("");
    $("#cash").val("");
    $("#balance").val("");
}
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
        $("#values").empty();

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
                let cus_index = customer_db.findIndex((item) => item.nic === $("#search-input").val());
                     if (!cus_index) {
                         $("#po-customer-id").val(customer_db[cus_index].customer_id);
                     }else {
                         showError("no found customer...");
                     }
            }else {
                showError("please finish current order before make new order");
                return;
            }
        }else {
            if(selectedValue === "by item") {
                let selected_item_index = item_db.findIndex((item) => item.item_name === $("#search-input").val());
                    if (!selected_item_index) {
                        $("#po-item-id").val(item_db[selected_item_index].item_id);
                        $("#po-item-name").val(item_db[selected_item_index].item_name);
                        $("#po-price").val(item_db[selected_item_index].price);
                        $("#qty-on-hand").val(item_db[selected_item_index].qty);
                    }
                    else {
                        showError("no found item...");
                }
            }
        }
    }
});

//generate next order-id
function generateNextOrderId() {
    $("#order-id").val("O00"+(order_detail_db.length + 1));
}

//check table when click purchase order button
// $("#purchase-order-btn").on('click', () => {
//     if ($("#po-table-body tr").length === 0) {
//         showError("please buy item before purchase...")
//         return;
    // }else {
    //     $("#purchase-model").modal('show');
    // }
// });

//check if table is none
function check_table() {
    if ($("#po-table-body tr").length === 0) {
        $("#purchase-order-btn").prop("disabled",true);
    }else{
        $("#purchase-order-btn").prop("disabled",false);
    }
}

//total set to total in purchase model
$("#purchase-order-btn").on('click', () => {
    $("#p-total").val($("#total-lbl").text());
});

//calculate total & balance after discount
$("#discount").on("keypress", async function (e) {
    let key = e.which;
    if(key == 13) {
        await $("#p-total").val($("#p-total").val() - ($("#p-total").val() / 100) * $("#discount").val());
        await $("#balance").val($("#cash").val() - $("#p-total").val());
    }
});

//calculate balance
$("#cash").on("keypress", async function (e) {
    let key = e.which;
    if(key == 13) {
        await $("#balance").val($("#cash").val() - $("#p-total").val());
    }
});

//check cash value is legal
$("#cash").on('input',function () {
    if(parseFloat($("#p-total").val()) > parseFloat($("#cash").val())) {
        $("#cash").css("border","2px solid red");
    }else {
        $("#cash").css("border","none");
    }
})