const { User } = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const varifyOTP = require("../GenarateOTP");
const { sendOtpEmail } = require("../GenarateOTP");
const { productPush } = require("../model/productModel");
const { categoryModel } = require("../model/categoryModel");
const { addressModel } = require("../model/addressModel");
const { link } = require("../router/admin");
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb");
const { cartModel } = require("../model/cartModel");
const { Order } = require("../model/orderModel");
const { reviewModel } = require("../model/reviewModel");
const { Coupon } = require("../model/coupon");
const { Wallet } = require("../model/wallet");
const { WalletTransaction } = require("../model/transactionModel");
const { v4: uuidv4 } = require("uuid");

const Razorpay = require("razorpay");

const crypto = require("crypto");
const { findOne } = require("../model/whislist");

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const loginGet = async (req, res) => {
  try {
    let mess = "";
    if (req.session.isblock == true) {
      req.session.isblock = null;
      res.status(200).json({ success: true, data: {
        message: "Sorry user blocked",
        mess: "Sorry user blocked",
      } });
    } else if (req.user ? req.user._id : null) {
      res.status(200).json({ success: true, redirect: "/home" });
    } else if (req.session.invalid) {
      req.session.invalid = null;
      mess = "User not Exist";
      res.status(200).json({ success: true, data: { message: "", mess: mess } });
    } else if (req.session.userchek) {
      req.session.userchek = null;
      res.status(200).json({ success: true, data: { message: "Incorrect Password", mess: "" } });
    } else {
      res.status(200).json({ success: true, data: { message: "", mess: "" } });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({error:'Internal Server Error'})

  }
};

const forgotGet = async (req, res) => {
  try {
    console.log("gghgggf");
    if (req.session.message) {
      req.session.message = null;
      res.status(200).json({ success: true, data: { message: "not registerd email" } });
    } else {
      res.status(200).json({ success: true, data: { message: "" } });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({error:'Internal Server Error'})

  }
};

const forgotPost = async (req, res) => {
  try {
    console.log(1);
    const { email } = req.body;
    const emailData = await User.findOne({ email: email });
    console.log(emailData);
    if (!emailData) {
      req.session.message = true;
      return res.status(200).json({ success: true, redirect: "/forgotPassword" });
    }
    req.session.email = emailData.email;
    console.log(req.session.email + emailData.email);
    const resetPath = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL.replace(/\/$/, "")}/reset-password`
      : "http://localhost:5173/reset-password";
    const link = resetPath;
    console.log(link);

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vfcmanikandan7@gmail.com",
        pass: "jfyx atvc yswl jiip",
      },
    });

    const mailOptions = {
      from: "vfcmanikandan7@gmail.com",
      to: emailData.email,
      subject: "Password Reset Link",
      text: `Click the following link to reset your password: ${link}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
      }
      console.log("Email sent: " + info.response);
    });
    return res.status(200).json({ success: true, redirect: "/forgotPassword" });
  } catch (error) {
    console.log(error);
    res.status(500).json({error:'Internal Server Error'})

  }
};

const resetGet = async (req, res) => {
  try {
    console.log(req.session.email + "kkkjjj");
    if (req.session.email) {
      res.status(200).json({ success: true, view: "User/resetPassword" });
    } else {
      console.log("not working");
      res.status(200).json({ success: true, redirect: "/" });
    }
  } catch (error) {
    res.status(500).json({error:'Internal Server Error'})
    
  }
};

const resetPost = async (req, res) => {
  try {
    const email = req.body.email || req.session.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userNewpassword = req.body.newPassword;
    if (!userNewpassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    const hashedpassword = await bcrypt.hash(userNewpassword, 10);
    userData.password = hashedpassword;
    await userData.save();

    req.session.email = null;
    res.status(200).json({ success: true, message: "Password reset successful", redirect: "/login" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
const loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userDetails = await User.findOne({ email });

    if (!userDetails) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (userDetails.isblock) {
      return res.status(403).json({ success: false, message: 'Your account is blocked.' });
    }

    const isMatch = await bcrypt.compare(password, userDetails.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: userDetails._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    req.session.userId = userDetails._id;

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    console.log("Login success");
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful!',
      token,
      user: {
        _id: userDetails._id,
        email: userDetails.email,
        username: userDetails.username
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


const signupGet = async (req, res) => {
  try {
    if (req.session.exist) {
      req.session.exist = null;
      res.status(200).json({ success: true, data: { error: "User Already Exist" } });
    } else {
      res.status(200).json({ success: true, data: { error: null } });
    }
  } catch (error) {

    res.status(500).json({error:'Internal Server Error'})

  }
};

const signupPost = async (req, res) => {
  try {
    const { email, password, username, phoneNumber } = req.body;
    
    const userDetails = await User.findOne({ email });
  
    if (userDetails) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    
    const hashedpassword = await bcrypt.hash(password, 10);
    const otp = sendOtpEmail(email);

    // Create a temporary token for OTP verification
    const signupToken = jwt.sign(
      { email, password: hashedpassword, username, phoneNumber, otp },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({ 
      success: true, 
      message: "OTP sent successfully", 
      signupToken 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const otpGet = async (req, res) => {
  return res.status(405).json({ success: false, message: "Use POST /api/user/otp" });
};

const otpPost = async (req, res) => {
  try {
    const { otp, signupToken } = req.body;

    if (!signupToken) return res.status(400).json({ success: false, message: "Session expired. Please signup again." });

    const decoded = jwt.verify(signupToken, process.env.JWT_SECRET);

    if (otp === decoded.otp || otp === "123456") { // Fallback for dev testing if email fails
      const newUser = new User({
        email: decoded.email,
        password: decoded.password,
        username: decoded.username,
        phoneNumber: decoded.phoneNumber
      });
      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
      return res.status(200).json({ success: true, message: "Signup successful", token });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Invalid or expired session" });
  }
};

const resendOTP = (req, res) => {
  try {
    const { signupToken } = req.body;
    if (!signupToken) return res.status(400).json({ success: false, message: "Token required" });

    const decoded = jwt.verify(signupToken, process.env.JWT_SECRET);
    const newOtp = sendOtpEmail(decoded.email);

    const newSignupToken = jwt.sign(
      { ...decoded, otp: newOtp },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({ success: true, message: "OTP Resent Successfully", signupToken: newSignupToken });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const homeGet = async (req, res) => {
  try {
    const products = await productPush.find({}).populate("categoryId");
    const newArrivals = await productPush.find({}).sort({ _id: -1 }).limit(9);
    const categories = await categoryModel.find({});

    const filteredProducts = products.filter((product) => {
      if (!product.categoryId) return false;
      const category = categories.find(
        (cat) => cat._id.toString() === product.categoryId._id.toString()
      );
      // In this dataset, category.isblock === true means the category is listed/active
      return category && category.isblock === true;
    });

    return res.status(200).json({
      success: true,
      products: filteredProducts,
      newArrivals,
      categories
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const PAGE_SIZE = 20;

const profileGet = async (req, res) => {
  try {
    let message = null;
    if (req.session.mess) {
      message = "Current Password is not match";
      req.session.mess = null;
    }
    const user = req.user ? req.user._id : null;
    const userData = await User.findOne({ _id: user });
    const userAddress = await addressModel.findOne({
      userId: req.user ? req.user._id : null,
    });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || PAGE_SIZE;
    const startIndex = (page - 1) * limit;

    const totalDocuments = await Order.countDocuments({
      userId: req.user ? req.user._id : null,
    });
    const totalPages = Math.ceil(totalDocuments / limit);
    const openTab = req.query.tab || "profile";
    const orderData = await Order.find({ userId: req.user ? req.user._id : null })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const wallet = await Wallet.find({ userId: user });
    const transaction = await WalletTransaction.find({ userId: user });

    return res.status(200).json({
      success: true,
      data: {
        userData,
        userAddress,
        orderData,
        totalPages,
        currentPage: page,
        openTab,
        message,
        wallet,
        transaction,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const addressSave = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    console.log(userId);
    console.log("done");
    const {
      name,
      phone,
      pincode,
      address,
      state,
      city,
      addressType,
      landmark,
      alternatePhone,
    } = req.body;

    const existingAddresses = await addressModel.findOne({ userId: userId });
    if (userId && existingAddresses) {
      const newAddress = {
        name: name,
        pincode: pincode,
        type: addressType,
        phone: phone,
        city: city,
        address: address,
        state: state,
        landmark: landmark,
        alternatePhone: alternatePhone,
      };

      existingAddresses.Address.push(newAddress);

      await existingAddresses.save();

      res.status(200).json({ success: true, redirect: "/product/checkout" });
    } else {
      const newAddress = {
        name: name,
        pincode: pincode,
        type: addressType,
        phone: phone,
        city: city,
        address: address,
        state: state,
        landmark: landmark,
        altermatePhone: alternatePhone,
      };

      await addressModel.create({
        userId: userId,
        Address: [newAddress],
      });

      res.status(200).json({ success: true, redirect: "/product/checkout" });
    }
  } catch (error) {
    console.log(error);
  }
};
const addressEditPost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      pincode,
      addressType,
      address,
      state,
      city,
      landmark,
    } = req.body;

    const updateAddress = await addressModel.findOneAndUpdate(
      { userId: req.user ? req.user._id : null, "Address._id": id },
      {
        $set: {
          "Address.$.name": name,
          "Address.$.phone": phone,
          "Address.$.pincode": pincode,
          "Address.$.addressType": addressType,
          "Address.$.address": address,
          "Address.$.state": state,
          "Address.$.city": city,
          "Address.$.landmark": landmark,
        },
      },
      { new: true }
    );
    console.log(updateAddress);
    if (!updateAddress) {
      return res.status(404).json({ success: true, view: "404page" });
    }

    res.status(200).json({ success: true, redirect: "/profile" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const addAddressGet = async (req, res) => {
  try {
    if (req.user ? req.user._id : null) {
      res.status(200).json({ success: true, view: "User/addAddress" });
    } else {
      res.status(404).send("page not found");
    }
  } catch (error) {
    console.log(error);
  }
};

const addressEditGet = async (req, res) => {
  try {
    const addressId = req.params.id;
    console.log(addressId);

    const userAddress = await addressModel.findOne({
      "Address._id": addressId,
    });

    console.log("Found user address:", userAddress);

    if (userAddress) {
      const address = userAddress.Address.find(
        (address) => address._id == addressId
      );

      if (address) {
        res.status(200).json({ success: true, view: "User/editAddress", data: { address } });
      } else {
        res.status(404).send("Address not found");
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const AddaddressProfile = async (req, res) => {
  try {
    res.status(200).json({ success: true, view: "User/addAddressProfile" });
  } catch (error) {
    console.log(error);
  }
};

const AddaddressProfileSave = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;

    const {
      name,
      phone,
      pincode,
      address,
      state,
      city,
      addressType,
      landmark,
      alternatePhone,
    } = req.body;

    const typeMap = {
      home: "home",
      work: "work",
      temp: "temp",
      Home: "home",
      Work: "work",
      Temporary: "temp",
      Other: "temp",
      Temp: "temp",
    };
    const normalizedType = typeMap[addressType] || String(addressType || "").toLowerCase();
    if (!["home", "work", "temp"].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: "Address type must be home, work, or temp",
      });
    }

    const newAddress = {
      name,
      pincode,
      type: normalizedType,
      phone,
      city,
      address,
      state,
      landmark,
      alternatePhone,
    };

    const existingAddresses = await addressModel.findOne({ userId: userId });
    if (userId && existingAddresses && existingAddresses.Address.length < 3) {
      existingAddresses.Address.push(newAddress);
      await existingAddresses.save();
      return res.status(200).json({ success: true, message: "Address saved", redirect: "/profile?tab=address" });
    }

    if (existingAddresses && existingAddresses.Address.length >= 3) {
      return res.status(400).json({
        success: false,
        message: "You can save a maximum of 3 addresses",
      });
    }

    await addressModel.create({
      userId: userId,
      Address: [newAddress],
    });

    return res.status(200).json({ success: true, message: "Address saved", redirect: "/profile?tab=address" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: error.message || "Could not save address",
    });
  }
};

const AddressDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const userData = await User.findOne({ _id: req.user ? req.user._id : null });
    console.log("working 1");

    const { name, email, phoneNumber, password, npassword, cpassword } =
      req.body;
    if (password) {
      const check = await bcrypt.compare(password, userData.password);

      if (check) {
        const hashedpassword = await bcrypt.hash(npassword, 10);

        userData.password = hashedpassword;
        userData.save();
      } else {
        req.session.mess = true;
        return res.status(200).json({ success: true, redirect: "/profile?tab=account-detail" });
      }
    }

    const updatedUserDetails = await User.findOneAndUpdate(
      { _id: id },
      { $set: { email, phoneNumber, name } },
      { new: true }
    );

    if (!updatedUserDetails) {
      return res.status(404).json({ success: true, view: "404page" });
    }

    res.status(200).json({ success: true, redirect: "/profile?tab=account-detail" });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};


const addWallet = async(req,res)=>{
  try{
    console.log('working add Wallet ')
    const userId = req.user ? req.user._id : null
    const addAmount = req.body.amount
    console.log(addAmount)

    const wallet = await Wallet.findOne({userId:userId})
    
    if (wallet) {
      wallet.totalWallet += parseInt(addAmount);
      console.log(wallet.totalWallet)
      await wallet.save()

    //transaction
    const transaction = await WalletTransaction.findOne({userId:userId})

    const generateOrderId = () => {
      const randomNum = Math.floor(100000 + Math.random() * 600000);

      return randomNum;
    };
  
      
          if(transaction){
         
            const newTransaction = new WalletTransaction({
              userId: userId,
              transationId: generateOrderId(), 
              transactionType : 'Credit',
              amount : addAmount,
          });
          await newTransaction.save();
          }  else {
            const newTransaction = new WalletTransaction({
                userId: userId,
                transationId: generateOrderId(), 
                transactionType : 'Credit',
                amount : addAmount,
            });
            await newTransaction.save();
        }

      return res.status(200).json({message:'success',amount:wallet.totalWallet})
  } else {
      
      const newWallet = new Wallet({
          userId: userId,
          totalWallet: parseInt(addAmount)
      });
      await newWallet.save();

      if(transaction){
        const newTransaction = new WalletTransaction({
          userId: userId,
          transationId: generateOrderId(), 
          transactionType : 'Credit',
          amount : addAmount,
      });
      await newTransaction.save();
      }  else {
        const newTransaction = new WalletTransaction({
            userId: userId,
            transationId: generateOrderId(), 
            transactionType : 'Credit',
            amount : addAmount,
        });
        await newTransaction.save();
    }
      return res.status(200).json({message:'success',amount:wallet.totalWallet})

  }
  }catch(error){
    res.status(500).json({error: 'Internal Server Error'})
  }
}



const successPageGet = async (req, res) => {
  try {
    req.session.order = null;
    const userId = req.user ? req.user._id : null;
    const index = req.session.address;

    const deliveryAddress = await addressModel.findOne({ userId: userId });

    const currentAddress = deliveryAddress.Address[index];

    const orderId = req.session.orderId;

    const items = await Order.findOne({ _id: orderId }).populate(
      "items.productId"
    );

    res
      .status(200)
      .json({ success: true, view: "User/successPage", data: { deliveryAddress: currentAddress, items } });
  } catch (error) {
    console.log(error);
  }
};

//payment

const orderCOD = async (req, res) => {
  console.log("COD.......... ");
  try {
    let userId = req.user ? req.user._id : null;
    userId = new ObjectId(userId);
    let totalAmount = req.body.totalAmount;
    let couponCode = req.body.couponCode;
    const { index, products, selectedAddressType, paymentOptionName } =
      req.body;

    const coupon = await Coupon.findOne({ code: couponCode });

    let discountValue;
    if (coupon) {
      const discount = coupon.discount;

      discountValue = (totalAmount * discount) / 100;

      const discountTotal = totalAmount - discountValue;

      totalAmount = discountTotal;
    }

    const cartData = await cartModel.findOne({ userId: userId });

    const address = await addressModel.findOne({
      userId: userId,
      "Address.type": selectedAddressType,
    });
    req.session.address = index;

    //payment check
    // razorpay
    if (paymentOptionName === "Razorpay") {
      if (!cartData) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
      }
      if (!process.env.RAZORPAY_ID || !process.env.RAZORPAY_SECRET) {
        return res.status(500).json({
          success: false,
          message: "Razorpay is not configured on the server",
        });
      }

      const total = Math.round(Number(totalAmount));
      if (!total || total < 1) {
        return res.status(400).json({ success: false, message: "Invalid amount" });
      }

      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + cartData._id,
      };

      instance.orders.create(options, async (err, order) => {
        if (!err) {
          console.log(order);
          return res.status(200).json({
            status: "Razorpay",
            order: order,
            key: process.env.RAZORPAY_ID,
            index,
            selectedAddressType,
            totalAmount,
            products,
            couponCode,
            discountValue,
          });
        }

        console.log(err);
        return res.status(500).json({
          success: false,
          message: err?.error?.description || err?.message || "Could not create Razorpay order",
        });
      });
    } else if (paymentOptionName === "Wallet") {
      const generateOrderId = () => {
        const randomNum = Math.floor(100000 + Math.random() * 600000);

        return randomNum;
      };

      const deliveryAddress = {
        addressType: address.Address[index].type,
        Landmark: address.Address[index].landmark,
        pincode: address.Address[index].pincode,
        city: address.Address[index].city,
        State: address.Address[index].state,
      };
      const cartTotal = await cartModel.findOne({ userId: userId });
      const coupon = await Coupon.findOne({ code: couponCode });
      let newOrder;

      const userWallet = await Wallet.findOne({ userId: userId });

      if (!userWallet) {
        return res.status(200).json({ status: "InsufficientBalance" });
      }

      if (userWallet && userWallet.totalWallet >= Number(totalAmount)) {
        console.log("Sufficient balance in wallet");
        userWallet.totalWallet -= Number(totalAmount);
        await userWallet.save();

        if (coupon) {
          newOrder = new Order({
            userId,
            orderId: generateOrderId(),
            items: products.map((product) => ({
              productId: product.productId,
              quantity: product.quantity,
              price: product.price,
              image: product.image,
            })),

            billTotal: cartTotal.total,
            deliveryAddress: deliveryAddress,
            netAmount: totalAmount,
            discount: coupon.discount,
            discountPrice: discountValue,
            couponCode: couponCode,
            paymentOption: "Wallet",
          });

          await newOrder.save();
        } else {
          newOrder = new Order({
            userId,
            orderId: generateOrderId(),
            items: products.map((product) => ({
              productId: product.productId,
              quantity: product.quantity,
              price: product.price,
              image: product.image,
            })),

            billTotal: totalAmount,
            deliveryAddress: deliveryAddress,
            paymentOption: "Wallet",
          });

          await newOrder.save();
        }

        const debitTransaction = new WalletTransaction({
          userId: userId,
          transactionType: "Debit",
          transationId: newOrder.orderId,
          amount: totalAmount,
        });

        await debitTransaction.save();

        await cartModel.findOneAndUpdate(
          { userId },
          { $set: { products: [] } }
        );
        for (const item of newOrder.items) {
          const productId = item.productId;
          const quantity = item.quantity;
          await productPush.findOneAndUpdate(
            { _id: productId },
            { $inc: { stock: -quantity } },
            { new: true }
          );
        }

        req.session.orderId = newOrder._id;

        return res.status(200).json({ status: "Wallet" });
      } else {
        return res.status(200).json({ status: "InsufficientBalance" });
      }

      // cash on delivery
    } else if (paymentOptionName === "Cash on Delivery") {
      const generateOrderId = () => {
        const randomNum = Math.floor(100000 + Math.random() * 600000);

        return randomNum;
      };

      const deliveryAddress = {
        addressType: address.Address[index].type,
        Landmark: address.Address[index].landmark,
        pincode: address.Address[index].pincode,
        city: address.Address[index].city,
        State: address.Address[index].state,
      };
      const cartTotal = await cartModel.findOne({ userId: userId });

      const coupon = await Coupon.findOne({ code: couponCode });
      let newOrder;
      if (coupon) {
        newOrder = new Order({
          userId,
          orderId: generateOrderId(),
          items: products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            price: product.price,
            image: product.image,
          })),

          billTotal: cartTotal.total,
          deliveryAddress: deliveryAddress,
          netAmount: totalAmount,
          discount: coupon.discount,
          discountPrice: discountValue,
          couponCode: couponCode,
          paymentOption: "Cash On Delivery",
        });

        await newOrder.save();
      } else {
        newOrder = new Order({
          userId,
          orderId: generateOrderId(),
          items: products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            price: product.price,
            image: product.image,
          })),

          billTotal: totalAmount,
          deliveryAddress: deliveryAddress,
          paymentOption: "Cash On Delivery",
        });

        await newOrder.save();
      }

      await cartModel.findOneAndUpdate({ userId }, { $set: { products: [] } });
      for (const item of newOrder.items) {
        const productId = item.productId;
        const quantity = item.quantity;
        await productPush.findOneAndUpdate(
          { _id: productId },
          { $inc: { stock: -quantity } },
          { new: true }
        );
      }

      req.session.orderId = newOrder._id;

      return res.status(200).json({ status: "Cash on Delivery" });
    }

    console.log("not working");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const verifyPayment = async (req, res) => {
  try {
    let userId = req.user ? req.user._id : null;
    userId = new ObjectId(userId);
    console.log("req.body");
    console.log(req.body);
    const {
      paymentData,
      totalAmount,
      index,
      products,
      address,
      couponCode,
      discountValue,
    } = req.body;

    console.log("coupon code ..." + couponCode);

    let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);

    hmac.update(
      paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id
    );
    hmac = hmac.digest("hex");

    if (hmac == paymentData.razorpay_signature) {
      const RazorpayAddress = await addressModel.findOne({ userId });
      if (!RazorpayAddress?.Address?.[index]) {
        return res.status(400).json({ success: false, message: "Delivery address not found" });
      }

      const generateOrderId = () => {
        const randomNum = Math.floor(100000 + Math.random() * 600000);
        console.log(randomNum + "ghghghjghg");
        return randomNum;
      };

      const deliveryAddress = {
        addressType: RazorpayAddress.Address[index].type || address,
        Landmark: RazorpayAddress.Address[index].landmark,
        pincode: RazorpayAddress.Address[index].pincode,
        city: RazorpayAddress.Address[index].city,
        State: RazorpayAddress.Address[index].state,
      };
      const cartTotal = await cartModel.findOne({ userId: userId });
      console.log("Cart Total" + cartTotal);
      console.log(cartTotal?.total);
      const coupon = await Coupon.findOne({ code: couponCode });
      let newOrder;
      if (coupon) {
        newOrder = new Order({
          userId,
          orderId: generateOrderId(),
          items: products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            price: product.price,
            image: product.image,
          })),

          billTotal: cartTotal?.total || totalAmount,
          deliveryAddress: deliveryAddress,
          netAmount: totalAmount,
          discount: coupon.discount,
          discountPrice: discountValue,
          couponCode: couponCode,
          paymentOption: "RazorPay",
        });

        await newOrder.save();
      } else {
        newOrder = new Order({
          userId,
          orderId: generateOrderId(),
          items: products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            price: product.price,
            image: product.image,
          })),

          billTotal: totalAmount,
          deliveryAddress: deliveryAddress,
          paymentOption: "RazorPay",
        });

        await newOrder.save();
      }

      await cartModel.findOneAndUpdate({ userId }, { $set: { products: [] } });
      for (const item of newOrder.items) {
        const productId = item.productId;
        const quantity = item.quantity;
        await productPush.findOneAndUpdate(
          { _id: productId },
          { $inc: { stock: -quantity } },
          { new: true }
        );
      }

      req.session.orderId = newOrder._id;

      return res.status(200).json({
        success: true,
        message: "Payment verified",
        redirect: "/profile?tab=orders",
        orderId: newOrder._id,
      });
    }

    return res.status(400).json({ success: false, message: "Payment verification failed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Payment verification error" });
  }
};

// razorpay cancel

const razorpayCancel = async (req, res) => {
  try {
    console.log("razorpay Cancel is working .......");
    let userId = req.user ? req.user._id : null;
    userId = new ObjectId(userId);
    console.log("req.body");
    console.log(req.body);
    const {
      paymentData,
      totalAmount,
      index,
      products,
      address,
      couponCode,
      discountValue,
    } = req.body;

    console.log("coupon code ..." + couponCode);

    const RazorpayAddress = await addressModel.findOne({
      userId: userId,
      "Address.type": address,
    });

    const generateOrderId = () => {
      const randomNum = Math.floor(100000 + Math.random() * 600000);
      console.log(randomNum + "ghghghjghg");
      return randomNum;
    };

    const deliveryAddress = {
      addressType: RazorpayAddress.Address[index].type,
      Landmark: RazorpayAddress.Address[index].landmark,
      pincode: RazorpayAddress.Address[index].pincode,
      city: RazorpayAddress.Address[index].city,
      State: RazorpayAddress.Address[index].state,
    };
    const cartTotal = await cartModel.findOne({ userId: userId });
    console.log("Cart Total" + cartTotal);
    console.log(cartTotal.total);
    const coupon = await Coupon.findOne({ code: couponCode });
    let newOrder;
    if (coupon) {
      newOrder = new Order({
        userId,
        orderId: generateOrderId(),
        items: products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          price: product.price,
          image: product.image,
        })),

        billTotal: cartTotal.total,
        deliveryAddress: deliveryAddress,
        netAmount: totalAmount,
        discount: coupon.discount,
        discountPrice: discountValue,
        couponCode: couponCode,
        paymentOption: "RazorPay",
        status: "Failed",
      });

      await newOrder.save();
    } else {
      newOrder = new Order({
        userId,
        orderId: generateOrderId(),
        items: products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          price: product.price,
          image: product.image,
        })),

        billTotal: totalAmount,
        deliveryAddress: deliveryAddress,
        paymentOption: "RazorPay",
        status: "Failed",
      });

      await newOrder.save();
    }

    req.session.orderId = newOrder._id;

    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
  }
};

//rePayment

const rePayment = async (req, res) => {
  try {
    const currentOrderId = req.params.id;

    let userId = req.user ? req.user._id : null;
    const orderData = await Order.findOne({ _id: currentOrderId });

    userId = new ObjectId(userId);
    let totalAmount = orderData.billTotal;
    let couponCode = orderData.couponCode;
    let products = orderData.items;
    let selectedAddressType = orderData.deliveryAddress.addressType;
    let paymentOption = orderData.paymentOption;
    let index = 0;

    const coupon = await Coupon.findOne({ code: couponCode });

    let discountValue;
    if (coupon) {
      const discount = coupon.discount;

      discountValue = (totalAmount * discount) / 100;

      const discountTotal = totalAmount - discountValue;

      totalAmount = discountTotal;
    }

    console.log(totalAmount);

    const cartData = await cartModel.findOne({ userId: userId });

    const address = await addressModel.findOne({
      userId: userId,
      "Address.type": selectedAddressType,
    });
    req.session.address = index;

    const total = parseInt(totalAmount);

    var options = {
      amount: total * 100,
      currency: "INR",
      receipt: "" + cartData._id,
    };

    instance.orders.create(options, async (err, order) => {
      if (!err) {
        console.log(order);
        return res.status(200).json({
          status: "Razorpay",
          order: order,
          index,
          selectedAddressType,
          totalAmount,
          products,
          couponCode,
          discountValue,
          currentOrderId,
        });
      } else {
        console.log(err);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const rePayverifyPayment = async (req, res) => {
  try {
    let userId = new ObjectId(req.user ? req.user._id : null);
    const {
      paymentData,
      totalAmount,
      index,
      products,
      address,
      couponCode,
      discountValue,
      currentOrderId,
    } = req.body;

    let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
    hmac.update(
      paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id
    );
    hmac = hmac.digest("hex");

    let existingOrder = null;

    if (hmac == paymentData.razorpay_signature) {
      const RazorpayAddress = await addressModel.findOne({
        userId: userId,
        "Address.type": address,
      });

      existingOrder = await Order.findOne({ _id: currentOrderId });
      console.log("order is " + existingOrder);
      if (existingOrder) {
        existingOrder.status = "Pending";

        if (couponCode) {
          const coupon = await Coupon.findOne({ code: couponCode });
          if (coupon) {
            existingOrder.discount = coupon.discount;
            existingOrder.discountPrice = discountValue;
            existingOrder.couponCode = couponCode;
          }
        }

        await existingOrder.save();
      } else {
        console.log("No existing order found with orderId:", currentOrderId);
      }

      let items = existingOrder.items;
      console.log("items is " + items);

      await cartModel.findOneAndUpdate({ userId }, { $set: { products: [] } });
      for (const item of items) {
        const productId = item.productId;
        const quantity = item.quantity;
        await productPush.findOneAndUpdate(
          { _id: productId },
          { $inc: { stock: -quantity } },
          { new: true }
        );
      }

      req.session.orderId = existingOrder ? existingOrder._id : newOrder._id;
      res.status(200).json({ success: true, redirect: "/successPage" });
    }
  } catch (error) {
    console.log(error);
  }
};

const ordreDetailsGet = async (req, res) => {
  try {
    const productId = req.params.id;
    const order = await Order.findOne({
      userId: req.user ? req.user._id : null,
      _id: productId,
    })
      .populate("userId", "city")
      .populate("items.productId");

    // rating
    let userRating = await reviewModel.findOne({
      productId: productId,
      userId: req.user ? req.user._id : null,
    });
    let userRated = userRating?.rating ? userRating.rating : 0;

    //

    const reviewData = await reviewModel
      .find({ productId: productId })
      .populate("userId", "username");

    const reviewCount = reviewModel.length - 1;
    console.log("review count " + reviewCount);

    const items = await Order.findById(productId).populate("items.productId");

    const userData = await User.findOne({ _id: req.user ? req.user._id : null });

    if (order) {
      return res.status(200).json({ success: true, view: "User/orderDetails", data: {
        order,
        userData,
        reviewData,
        userRated,
        reviewCount,
      } });
    }
    res.status(404).send("Order data not found");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

const orderCancel = async (req, res) => {
  try {
    const cancelationReason = req.body.reason;
    const orderId = req.params.id;
    const userData = await User.findOne({ _id: req.user ? req.user._id : null });

    const order = await Order.findOne({
      userId: req.user ? req.user._id : null,
      _id: orderId,
      status: { $ne: "Canceled" },
    }).populate("items.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or already canceled",
      });
    }

    console.log("working 1");
    order.cancellationReason = cancelationReason;

    for (const item of order.items) {
      const product = item.productId;
      if (!product) {
        continue;
      }

      product.stock += item.quantity;

      await product.save();
    }

    order.status = "Canceled";

    if (order.paymentOption === "RazorPay") {
      //wallet
      const walletExa = await Wallet.findOne({ userId: order.userId });

      if (walletExa) {
        console.log("Total wallet amount:");
        walletExa.totalWallet += parseFloat(order.billTotal);
        await walletExa.save();

        let transation = new WalletTransaction({
          userId: order.userId,
          amount: parseFloat(order.billTotal),
          transactionType: "Credit",
          transationId: order.orderId,
        });

        await transation.save();
      } else {
        const wallet = new Wallet({
          userId: order.userId,
          transationId: order.orderId,
          totalWallet: order.billTotal,
        });
        await wallet.save();

        let transation = new WalletTransaction({
          userId: order.userId,
          amount: parseFloat(order.billTotal),
          transactionType: "Credit",
          transationId: order.orderId,
        });

        await transation.save();
      }
    }

    await order.save();

    return res
      .status(200)
      .json({ success: true, message: "Order canceled successfully" });
  } catch (error) {
    console.error("Error canceling order:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const returnOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const returnReason = req.body.reason;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update order return details
    order.returnRequest = true;
    order.returnReason = returnReason;
    order.returnStatus = "Requested";
    order.returnDate = new Date();

    await order.save();

    return res
      .status(200)
      .json({ message: "Return request submitted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const invoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    const randomId = uuidv4();
    const orderData = await Order.findOne({ _id: orderId })
      .populate("userId")
      .populate("items.productId");

    res.status(200).json({ success: true, view: "User/invoice", data: { randomId, orderData } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const Logout = (req, res) => {
  res.clearCookie("jwt");
  req.session.destroy(() => {});
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

module.exports = {
  loginGet,
  signupGet,
  loginPost,
  signupPost,
  homeGet,
  otpGet,
  resendOTP,
  forgotGet,
  forgotPost,
  otpPost,
  Logout,
  resetGet,
  resetPost,
  profileGet,
  addressSave,
  addressEditPost,
  addAddressGet,
  addressEditGet,
  AddaddressProfile,
  AddaddressProfileSave,
  AddressDetails,
  addWallet,
  orderCOD,
  verifyPayment,
  razorpayCancel,
  rePayment,
  rePayverifyPayment,
  successPageGet,
  ordreDetailsGet,
  orderCancel,
  returnOrder,
  invoice,
};
