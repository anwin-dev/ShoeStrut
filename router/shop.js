const express = require('express')
const router = express.Router()
const UserProductController=require('../controller/shop')
const UserCartController=require('../controller/cart')
const CouponController = require('../controller/coupon')
const { route } = require('./admin')
const {userAuthentication}=require('../middleware/userAuth')

// Product details & shop listing are public (catalog browsing)
router.get('/details/:id',UserProductController.productDetailsGet)

router.post('/ratings',userAuthentication,UserProductController.Ratings)

router.post('/star',userAuthentication,UserProductController.Star)

router.put('/editReview',userAuthentication,UserProductController.editReview)

router.delete('/reviewDelete/:id',userAuthentication,UserProductController.deleteReview)

router.get('/shop',UserProductController.shopGet)

router.get('/categoryFiltering',UserProductController.CategoryFilter)

router.post('/ShopPageSort', UserProductController.ShopSort);

router.post('/shopSearch',UserProductController.ShopSearch);

//whislist
router.get('/wishlist',userAuthentication,UserProductController.whislistGet)

router.get('/addWhislis/:id',userAuthentication,UserProductController.addWhislist)

router.get('/addToCartWishlist/:id',userAuthentication,UserProductController.addToCartWislist)

router.delete('/remove-wishlist/:id/',userAuthentication,UserProductController.removeWishlist)


//cart
router.get('/cart',userAuthentication,UserCartController.cartGet)

router.get('/addcart/:id',userAuthentication,UserCartController.cartAdd)
    
router.post('/updateQuantity/:id',userAuthentication,UserCartController.qtyUp)

router.get('/getQuantity/:id',userAuthentication,UserCartController.qtyUpdation)

router.delete('/remove/:id', userAuthentication,UserCartController.removeDelete);

router.get('/checkout',userAuthentication,UserCartController.checkoutGet)

router.get('/checkout/verify',userAuthentication,UserCartController.checkVerify)


//Coupon

router.post('/apply-coupon',userAuthentication,CouponController.applyCoupon)

router.post('/remove-coupon',userAuthentication,CouponController.RemoveCoupon)







module.exports=router