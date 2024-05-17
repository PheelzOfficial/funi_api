const userModel = require("../models/user");
const productModel = require("../models/product");
const cartModel = require("../models/cart");
const { validateProduct } = require("../middlewares/validate");
const { v4: uuidv4 } = require("uuid");

const upload = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const checkUser = await userModel.findOne({ _id: userId });
      if (!checkUser) {
        return res.status(404).json({
          message: "Access denied, user does not exist",
          status: 404,
        });
      }

      const { error } = validateProduct(req.body);
      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
          statusCode: 400,
          success: false,
        });
      }

      if (!req.files) {
        return res.status(404).json({
          message: "Images not found",
          statusCode: 404,
          success: false,
        });
      }

      const { title, price, description, category } = req.body;

      const images = req.files.images;

      if (!Array.isArray(images)) {
        return res.status(400).json({
          message: "Images must be atleast two",
          statusCode: 400,
          success: false,
        });
      }
      const hostname = `${req.protocol}://${req.get("host")}`;
      let imageArr = [];

      await Promise.all(
        images.map(async (item) => {
          const fileExtension = item.name.split(".").pop();
          const newname = `${uuidv4()}.${fileExtension}`;
          const filePath = `${hostname}/public/products/${newname}`;
          imageArr.push(filePath);
          const fileDir = `public/products/${newname}`;
          await item.mv(fileDir);
        })
      );

      await productModel.create({
        title: title,
        price: price,
        description: description,
        category: category,
        images: imageArr,
        postedBy: checkUser._id,
      });

      return res.status(200).json({
        message: "Product posted successfully",
        status: 200,
      });
    } else {
      return res.status(403).json({
        message: "Access denied",
        status: 403,
      });
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Error Occured !",
      status: 500,
    });
  }
};

const products = async (req, res) => {
  try {
    const products = await productModel.find().populate("postedBy");
    if (!products || products.length < 1) {
      return res.status(404).json({
        message: "No product found !",
      });
    }

    res.status(200).json({
      message: "Product fethed succesfully",
      poducts: products,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Error Occured !",
      error: err.message,
    });
  }
};

const addCarts = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const user = await userModel.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({
          message: "User not found !",
          status: 404,
        });
      }

      const productId = req.params.productId;
      if (!productId) {
        return res.status(400).json({
          message: "Product not found !",
          status: 400,
        });
      } else {
        const product = await productModel.findOne({ _id: productId });
        if (!product) {
          console.log("I am here");
          return res.status(400).json({
            message: "Product not found !",
            status: 400,
          });
        }

        const checkCart = await cartModel.findOne({
          productId: product._id,
          userId: user._id,
        });
        if (checkCart) {
          return res.status(409).json({
            message: "Product already added to cart",
          });
        }

        await cartModel.create({
          productId: productId,
          userId: user._id,
        });

        return res.status(200).json({ message: "Product added to cart" });
      }
    } else {
      return res.status(400).json({
        message: "You are not logged in",
        status: 400,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Error Occured while adding to cart!",
      error: err.message,
    });
  }
};

const getCarts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({
        message: "User is not logged in",
      });
    }

    const userId = req.user.id;
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User does not exist",
      });
    }

    const carts = await cartModel
      .find({ userId: user._id })
      .populate("productId");

    if (!carts || carts.length === 0) {
      return res.status(404).json({
        message: "Cart is empty",
        cart: [],
      });
    }

    return res.status(200).json({
      message: "Cart successfully fetched",
      cart: carts,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error Occured while fetching carts!",
      error: err.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({
        message: "You are not logged in",
      });
    }

    const userId = req.user.id;
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        message: "user does not exist",
      });
    }

    const cartId = req.params.cartId;
    if (!cartId) {
      return res.status(404).json({
        message: "Request not completed !",
      });
    }

    const checkCart = await cartModel.findOne({ _id: cartId });
    if (!checkCart) {
      return res.status(404).json({
        message: "Request not completed !",
      });
    }

    await cartModel.findByIdAndDelete(checkCart._id);

    return res.status(200).json({
      message: "Cart successfully deleted",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error Occured while deleting!",
      error: err.message,
    });
  }
};

const updateInfo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({
        message: "You are not logged in",
      });
    }

    const userId = req.user.id;
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const { password, city, state, phoneNumber, zipcode, address } = req.body;

    user.password = password;
    user.city = city;
    user.state = state;
    user.phoneNumber = phoneNumber;
    user.zipcode = zipcode;
    user.address = address;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Error Occured while updating!",
      error: err.message,
    });
  }
};

module.exports = { upload, products, addCarts, getCarts, deleteProduct, updateInfo };
