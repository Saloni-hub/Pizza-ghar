
import axios from 'axios';
import Noty from 'noty'
import initAdmin from './admin'
import moment from 'moment'
// client side
let addtToCart = document.querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector('#cart-counter');
function updateCart(pizza) {
    // Ajax call (use axios)
    axios.post('/update-cart',pizza).then(res => {
        console.log(res);
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: 'success',
            timeout: 1000,
            progressBar: false,
            text: 'Item added to cart'
        }).show();
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 1000,
            progressBar: false,
            text: 'something went wrong'
        }).show();
    })
}
addtToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let pizza = JSON.parse(btn.dataset.pizza);
        updateCart(pizza)
        console.log(pizza);
    })
})
// remove alert msg
const alertmsg = document.querySelector('#success-alert');
if(alertmsg) {
    setTimeout(() => {
        alertmsg.remove()
    },2000)
}

// call admin
initAdmin();

// change order status
let statuses = document.querySelectorAll('.status-line');
let hidden_input = document.querySelector('#hidden-input')
let order = hidden_input ? hidden_input.value : null
order = JSON.parse(order)

let time = document.createElement('small')
function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepcompleted = true;
    statuses.forEach((status) => {
        let dataProp = status.dataset.status;
        if(stepcompleted) {
            status.classList.add('step-completed')
        } 
        if(dataProp === order.status) {
            stepcompleted=false;
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if(status.nextElementSibling){
                status.nextElementSibling.classList.add('current')
            }
        }
    })
}

updateStatus(order)

// socket
let socket = io()
// Join
if(order){
socket.emit('join', `order_${order._id}`)
}
socket.on('orderUpdated',(data) => {
    const UpdatedOrder =  {...order }
    UpdatedOrder.updatedAt = moment().format('hh:mm A')
    UpdatedOrder.status = data.status
    updateStatus(UpdatedOrder);
    new Noty({
        type: 'success',
        timeout: 1000,
        progressBar: false,
        text: 'Order updated'
    }).show();
    console.log(UpdatedOrder)
})
