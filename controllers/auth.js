const userModel = require("../models/user");
const productModel = require("../models/product");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { MailSending } = require("../middlewares/email");
const { createAccount, loginAccount } = require("../middlewares/validate");

const createUser = async (req, res) => {
  try {
    const { error } = createAccount(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        statusCode: 400,
        success: false,
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      city,
      state,
      address,
      zipcode,
      phoneNumber,
    } = req.body;

    const checkEmail = await userModel.findOne({ email: email });
    if (checkEmail) {
      return res.status(409).json({
        message: "Email already in use, please login",
        statusCode: 409,
        success: false,
      });
    }

    const newUser = await userModel.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      city: city,
      state: state,
      address: address,
      zipcode: zipcode,
      phoneNumber: phoneNumber,
    });

    await MailSending({
      email: req.body.email,
      subject: "Account created successfully",
      html: `<div>Hello, ${newUser.firstName} ${newUser.lastName}, you have successfully created an account with us. Kindly stay tuned!</div>`,
    });

    const token = await jwt.sign({ id: newUser._id }, process.env.jwt_key);
    res.cookie(token, "api_authorization_token");

    res.header("Authorization", token).status(200).json({
      token: token,
      user: newUser,
      message: "Account created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error Occured !",
      statusCode: 500,
      success: false,
      error: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { error } = loginAccount(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        statusCode: 400,
      });
    }

    const { email, password } = req.body;
    const checkEmail = await userModel.findOne({ email: email });

    if (!checkEmail) {
      return res.status(404).json({
        message: "Email does not exist !",
        statusCode: 404,
      });
    }

    const compare = await bcrypt.compare(password, checkEmail.password);
    if (!compare) {
      return res.status(404).json({
        message: "Email/Password mismatch",
        statusCode: 404,
      });
    }

    const token = await jwt.sign({ id: checkEmail._id }, process.env.jwt_key);
    res.cookie(token, "api_authorization_token");

    res.header("Authorization", token).status(200).json({
      token: token,
      user: checkEmail,
      message: "logged in successfully",
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Error Occured !",
      statusCode: 500,
      error: err.message,
    });
  }
};

module.exports = { createUser, login };
