const { User } = require("../model/userModel");
const bcrypt = require("bcrypt");
const varifyOTP = require("../GenarateOTP");
const { sendOtpEmail } = require("../GenarateOTP");
const { productPush } = require("../model/productModel");
const { categoryModel } = require("../model/categoryModel");
const { cartModel } = require("../model/cartModel");
const { addressModel } = require("../model/addressModel");
const { ObjectId } = require("mongodb");
const { Coupon } = require("../model/coupon");

const cartGet = async (req, res) => {
  try {
    const cartData = await cartModel.findOne({ userId: req.user ? req.user._id : null });
    if (!cartData || !cartData.products?.length) {
      return res.status(200).json({
        success: true,
        data: { cartData: null, count: 0 },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        cartData,
        count: cartData.products.reduce((sum, p) => sum + (p.quantity || 0), 0),
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const cartAdd = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }
    const product = await productPush.findOne({ _id: productId });
    if (product) {
      const { title, image, offerPrice } = product;
      let Price = product.Price;
     
      const userId = req.user ? req.user._id : null;
      const existingCart = await cartModel.findOne({ userId: userId });
     
      if (product.offerPrice > 0) {
        
        Price = product.offerPrice;
        
      }
      if (existingCart) {
        const existingProductIndex = existingCart.products.findIndex(
          (item) => item.productId.toString() === productId
        );
        if (existingProductIndex !== -1) {
          existingCart.products[existingProductIndex].quantity++;
          existingCart.products[existingProductIndex].total =
            existingCart.products[existingProductIndex].Price *
            existingCart.products[existingProductIndex].quantity;
        } else {
          existingCart.products.push({
            productId: productId,
            title: title,
            Price: Price,
            image: image,
            quantity: 1,
            total: Price,
          });
        }
        existingCart.total = calculateTotal(existingCart.products);
        await existingCart.save();
      } else {
        await cartModel.create({
          userId: userId,
          products: [
            {
              productId: productId,
              title: title,
              Price: Price,
              image: image,
              quantity: 1,
              total: Price,
            },
          ],
          total: Price,
        });
      }

      const updatedCart = await cartModel.findOne({ userId });
      return res.status(200).json({
        success: true,
        message: "Added to cart",
        data: {
          cartData: updatedCart,
          count: updatedCart?.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0,
        },
      });
    } else {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
const calculateTotal = (products) => {
  return products
    .reduce(
      (total, product) =>
        total + parseFloat(product.Price) * parseInt(product.quantity),
      0
    )
    .toFixed(2);
};

const qtyUp = async (req, res) => {
  const { action } = req.body;
  let productId = req.params.id;
  

  try {
    productId = new ObjectId(productId);
    const product = await cartModel.findOne({ "products._id": productId });
  
    if (!product) {
     
      return res.status(404).send("Product not found");
    }

    let matchedProduct = product.products.find((p) => p._id.equals(productId));
    const productData = await productPush.findOne({
      _id: matchedProduct.productId,
    });
   

    if (action === "increment") {
    

      if (matchedProduct.quantity < 5) {
      
        if (matchedProduct.quantity < productData.stock) {
          matchedProduct.quantity += 1;
         
          
          matchedProduct.total = matchedProduct.quantity * matchedProduct.Price;
        

          product.total = calculateTotal(product.products);
        } else {
          return res
            .status(200)
            .json({ status: "exceeded", quantity: matchedProduct.quantity });
        }
      } else {
        
        return res
          .status(200)
          .json({ status: "minimum", quantity: matchedProduct.quantity });
      }
    } else if (action === "decrement" && matchedProduct.quantity > 1) {
    
      matchedProduct.quantity -= 1;
      matchedProduct.total = matchedProduct.quantity * matchedProduct.Price;
      product.total = calculateTotal(product.products);
    }
    await product.save();
   
    res.status(200).json({
      matchedProduct,
      product,
      quantity: matchedProduct.quantity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const removeDelete = async (req, res) => {
  try {
    const userId = new ObjectId(req.user ? req.user._id : null);
    const productId = new ObjectId(req.params.id);

    const productRemovalResult = await cartModel.updateOne(
      { userId, "products._id": productId },
      { $pull: { products: { _id: productId } } }
    );

    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found for the user" });
    }
    if (cart && cart.products.length === 0) {
      const cartRemovalResult = await cartModel.deleteOne({ userId });
    }

    return res.status(200).json({ message: "Product removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkoutGet = async (req, res) => {
  try {
    if (req.session.order) {
      const cartData = await cartModel.findOne({ userId: req.user ? req.user._id : null });

      const userAddress = await addressModel.findOne({
        userId: req.user ? req.user._id : null,
      });

      if (!cartData) {
        return res.status(404).json({ message: "Cart not found for the user" });
      }

      const products = cartData.products;

      products.forEach((Element) => {
        
      });

      const subtotal = products.reduce(
        (acc, product) => acc + product.total,
        0
      );

      const coupons = await Coupon.find({});

      res.status(200).json({ success: true, data: { products, subtotal, userAddress, coupons } });
    } else {
      res.status(200).json({ success: true, redirect: "/product/cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkVerify = async (req, res) => {
  try {
    req.session.order = true;
    res.status(200).json({ success: true, redirect: "/product/checkout" });
  } catch (error) {
    console.log(error);
  }
};

const qtyUpdation = async (req, res) => {
  let productId = req.params.id;
 
  productId = new ObjectId(productId);
  const product = await cartModel.findOne({ "products._id": productId });

  if (!product) {
    console.log("404");
    return res.status(404).send("Product not found");
  }

  let matchedProduct = product.products.find((p) => p._id.equals(productId));
  const productData = await productPush.findOne({
    _id: matchedProduct.productId,
  });
  

  res.status(200).json({
    quantity: matchedProduct.quantity,
  });
};

module.exports = {
  cartAdd,
  cartGet,
  qtyUp,
  removeDelete,
  checkoutGet,
  checkVerify,
  qtyUpdation,
};
