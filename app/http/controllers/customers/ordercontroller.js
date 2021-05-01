const { find } = require('laravel-mix/src/File');
const Order = require('../../../models/order');
const moment = require('moment');
function orderController() {
    return {
        store(req,res) {
            // validate request
            const { phone, address } = req.body;
            if(!phone || !address) {
                req.flash('error', 'All feilds are required');
                return redirect('/cart');
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address: address,
            })
            order.save().then(result => {
               req.flash('success', 'Order placed successfully')
               delete req.session.cart
               return res.redirect('/customer/orders');
            }).catch(error => {
                req.flash('error', 'Something went wrong');
                return res.redirect('/cart')
            })
        },
        async index(req,res) {
            const orders = await Order.find({ customerId: req.user._id },
                null,{sort: { 'createdAt': -1}})  //descending order ke liye -1
            // console.log(orders)
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate,max-stale=0, post-check=0,pre-check=0')
            res.render('customers/orders', { orders: orders, moment: moment});
        },
        async show(req,res) {
           const order = await Order.findById(req.params.id)
          //Authorize user
        if(req.user._id.toString() === order.customerId.toString()) {
            return res.render('customers/singleorder', { order})
        } 
        return res.redirect('/')
    }
}
}
module.exports = orderController