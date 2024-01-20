const express = require("express");
const router = express.Router();
const customersController = require('../../../controllers/sites/admin/customers.c')

router.get('/', customersController.showCustomers)
router.post('/add', customersController.addNewCustomer)
router.get('/getPerpage', customersController.getCustomerPerPage)
router.get('/searchcustomer', customersController.getSearchCustomer)

module.exports = router;