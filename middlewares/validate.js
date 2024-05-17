const Joi = require("joi");

const createAccount = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().min(3),
    lastName: Joi.string().required().min(3),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    city: Joi.string().required(),
    state: Joi.string().required(),
    address: Joi.string().required(),
    zipcode: Joi.number().required(),
    phoneNumber: Joi.string().required(),
  });

  return schema.validate(data);
};

const loginAccount = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

const validateProduct = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports.createAccount = createAccount;
module.exports.loginAccount = loginAccount;
module.exports.validateProduct = validateProduct;
