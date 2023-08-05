const mongoose = require("mongoose");

const URL_REGEX =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

const DEFAULT_VALIDATION = {
  type: String,
  trim: true,
  minLength: 2,
  maxLength: 256,
  lowercase: true,
};

const regexType = (regex, required = true, unique = false) => {
  return {
    type: String,
    required,
    match: RegExp(regex),
    unique,
    trim: true,
  };
};

const nameSchema = new mongoose.Schema({
  first: DEFAULT_VALIDATION,
  middle: {
    type: String,
    trim: true,
    minLength: 2,
    maxLength: 256,
    lowercase: true,
    required: false,
  },
  last: DEFAULT_VALIDATION,
});

const imageSchema = new mongoose.Schema({
  url: regexType(URL_REGEX, false),
  alt: {
    type: String,
    trim: true,
    minLength: 2,
    maxLength: 256,
    lowercase: true,
    required: false,
  },
});

const addressSchema = new mongoose.Schema({
  state: {
    type: String,
    trim: true,
    maxLength: 256,
    lowercase: true,
    required: false,
  },
  country: DEFAULT_VALIDATION,
  city: DEFAULT_VALIDATION,
  street: DEFAULT_VALIDATION,
  houseNumber: {
    type: Number,
    minLength: 1,
    required: true,
  },
  zip: {
    type: Number,
    minLength: 1,
    default: 0,
  },
});

const schema = new mongoose.Schema({
  name: nameSchema,
  phone: regexType(/0[0-9]{1,2}\-?\s?[0-9]{3}\s?[0-9]{4}/),
  email: regexType(
    /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
    true,
    true
  ),
  password: regexType(
    /((?=.*\d{1})(?=.*[A-Z]{1})(?=.*[a-z]{1})(?=.*[!@#$%^&*-]{1}).{7,20})/
  ),
  image: imageSchema,
  address: addressSchema,
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isBusiness: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("user", schema);

module.exports = User;
