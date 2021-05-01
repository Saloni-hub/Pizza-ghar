const authControllere = require('../app/http/controllers/authController');
const cartController = require('../app/http/controllers/customers/cartController');
const homecontroller = require('../app/http/controllers/homeController');
const orderController = require('../app/http/controllers/customers/ordercontroller');
const AdminorderController = require('../app/http/controllers/admin/orderController');
const  statusController = require('../app/http/controllers/admin/statusController')
// middlewares
const auth = require('../app/http/middleware/auth');
const guest = require('../app/http/middleware/guest');
const admin = require('../app/http/middleware/admin');
function initRoutes(app) {
    app.get('/',   homecontroller().index);
    app.get('/cart',cartController().index);
    app.post('/update-cart', cartController().update);

    app.get('/login', guest, authControllere().login);
    app.post('/login',authControllere().postlogin);
    app.get('/register',guest,authControllere().register);
    app.post('/register',authControllere().postregister);
    app.post('/logout',authControllere().postlogout);
   
    // customer routes
    app.post('/orders',auth,orderController().store);
    app.get('/customer/orders',auth,orderController().index);
    app.get('/customer/orders/:id',auth,orderController().show);

    // admin routes
    app.get('/admin/orders',admin,AdminorderController().index);
    app.post('/admin/order/status',admin,statusController().update);
}

module.exports = initRoutes;