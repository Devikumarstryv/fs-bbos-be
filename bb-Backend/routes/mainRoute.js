const express = require('express');
const path = require('path');
const router = express.Router();
const userController = require('../cotrollers/userController');
const {userLogin,userLogOut,userRegistration,checkLogin} = require('../cotrollers/loginController')
const {verifyJWTToken} = require('../utlis/verifyJWTToken')

const {getDashboardDetails} = require('../cotrollers/dashboardController');

router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

router.post('/login',userLogin)
router.get('/logout',verifyJWTToken,userLogOut)
router.get('/checkLogin',verifyJWTToken,checkLogin)
router.post('/register',userRegistration)

router.post('/dashboard',verifyJWTToken,getDashboardDetails)

router.get('/login',function(req,res){
    res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});






module.exports = router;
