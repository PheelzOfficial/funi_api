const express = require("express");
const router = express.Router();
const { upload, products, addCarts, getCarts, deleteProduct, updateInfo } = require("../controllers/home");
const { verify } = require("../middlewares/verify");

router.post("/upload", verify, upload);
router.get("/products", products);
router.get("/cart", verify, getCarts);
router.get("/cart/:productId", verify, addCarts);
router.get("/delete-cart/:cartId", verify, deleteProduct);
router.post("/update/profile", verify, updateInfo);

module.exports = router;

// asynchronous operation
// synchronous opreration