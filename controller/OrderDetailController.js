import {order_detail_db} from "./PlaceOrder.js";

//search orders
$("#search-input").on("input", function () {
    $("#od-table-body").empty();
    order_detail_db.map((item, index) => {
        if(item.date.toLowerCase().startsWith($("#search-input").val().toLowerCase()) || item.customer_id.toLowerCase().startsWith($("#search-input").val().toLowerCase()) || item.order_id.toLowerCase().startsWith($("#search-input").val().toLowerCase())) {
            $("#od-table-body").append(`<tr><td>${item.date}</td><td>${item.customer_id}</td><td class="orderId">${item.order_id}</td><td>${item.items}</td><td>${item.total}</td></tr>`);
        }
    })
});

//delete order detail
let order_id;
$("#od-crudButtons button").eq(0).on('click', () => {
    console.log(order_detail_db);
    order_detail_db.splice(order_detail_db.findIndex(item => item.order_id === order_id), 1);
    console.log(order_detail_db);
    loadAll();
});

//get id from clicked raw
$("#od-table-body").on('click', ('tr'), function () {
    order_id = $(this).find(".orderId").text();
})

//load all details
function loadAll() {
    $("#od-table-body").empty();
    order_detail_db.map((item, index) => {
        $("#od-table-body").append(`<tr><td>${item.date}</td><td>${item.customer_id}</td><td class="orderId">${item.order_id}</td><td>${item.items}</td><td>${item.total}</td></tr>`);
    });
}