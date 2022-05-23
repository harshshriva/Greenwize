const express = require('express');
const router = express.Router();

const userController = require("../controller/userController")
const bookController = require('../controller/bookController')
const {authentication,authorization}  = require("../middleware/authe&Auth");
const reviewController = require('../controller/reviewController');

//User APIs
router.post("/register",userController.createUser)
router.post('/login', userController.userLogin)

//Books APIs

router.post("/books",authentication,bookController.createBook)
router.post("/write-file-aws",bookController.writefileaws)
router.get("/books",authentication,bookController.getBooks)
router.get("/books/:bookId",authentication,bookController.getBookById)
router.put("/books/:bookId",authentication,authorization,bookController.updateBook)
router.delete("/books/:bookId",authentication,authorization,bookController.deleteBooks)



//Review APIs
router.post("/books/:bookId/review",reviewController.addReview)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)
router.delete('/books/:bookId/review/:reviewId',reviewController.deleteReview);

module.exports=router;