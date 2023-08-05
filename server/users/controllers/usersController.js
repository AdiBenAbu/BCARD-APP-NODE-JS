const { handleError } = require("../../utils/handleErrors");
const User = require("../models/mongoose/User");
const lodash = require("lodash");
const normalizeUser = require("../helpers/normalizeUser");
const registerValidation = require("../models/Joi/registerValidation");
const { comparePassword } = require("../helpers/bcrypt");
const loginValidation = require("../models/Joi/loginValidation");
const { generateAuthToken } = require("../../auth/Providers/jwt");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const newUser = req.body;
    const { email } = newUser;

    const { error } = registerValidation(newUser);
    if (error)
      return handleError(res, 400, `Joi Error: ${error.details[0].message}`);

    const usedEmail = await User.findOne({ email: email });
    if (usedEmail)
      return handleError(
        res,
        409,
        "Authentication Error: User already registered!"
      );

    const NormalizeUser = normalizeUser(newUser);
    const userToDB = new User(NormalizeUser);
    const userFromDB = await userToDB.save();
    const user = lodash.pick(userFromDB, "_id", "name", "email", "password");
    res.send(user);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

const login = async (req, res) => {
  try {
    const user = req.body;
    const { email } = user;

    const { error } = loginValidation(user);
    if (error)
      return handleError(res, 400, `Joi Error: ${error.details[0].message}`);

    const userInDb = await User.findOne({ email });
    if (!userInDb)
      throw new Error("Authentication Error: Invalid email or password");

    const isPasswordValid = comparePassword(user.password, userInDb.password);

    if (!isPasswordValid)
      throw new Error("Authentication Error: Invalid email or password");

    const { _id, isBusiness, isAdmin } = userInDb;
    const token = generateAuthToken({ _id, isBusiness, isAdmin });

    res.send(token);
  } catch (error) {
    const isAuthError =
      error.message === "Authentication Error: Invalid email or password";

    return handleError(
      res,
      isAuthError ? 403 : 500,
      `Mongoose Error: ${error.message}`
    );
  }
};

const getUsers = async (req, res) => {
  try {
    const user = req.user;
    if (!user.isAdmin)
      return handleError(
        res,
        403,
        "Forbidden Error: This user has not permission to access users"
      );
    const users = await User.find({}, { password: 0, __v: 0 }).sort({
      createdAt: "ascending",
    });
    if (!users)
      return handleError(
        res,
        404,
        "Not Found: Users cannot be found in the database"
      );
    res.send(users);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = req.user;
    if (user._id != userId && !user.isAdmin)
      return handleError(
        res,
        403,
        "Forbidden Error: This user has not permission to access users"
      );
    const userFromDB = await User.findById(userId);
    if (!userFromDB)
      return handleError(
        res,
        404,
        "Not Found: This user cannot be found in the database"
      );
    res.send(userFromDB);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

const changeIsBusinessStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = req.user;
    if (user._id != userId && !user.isAdmin)
      return handleError(
        res,
        403,
        "Forbidden Error: Only admin user or the user himself in order to change a business status of user account"
      );
    const pipeline = [{ $set: { isBusiness: { $not: "$isBusiness" } } }];
    const configuration = { new: true };

    const userFromBd = await User.findByIdAndUpdate(
      userId,
      pipeline,
      configuration
    );
    if (!userFromBd)
      return handleError(
        res,
        404,
        "Not Found: User with this Id cannot be found in the database"
      );
    return res.send(userFromBd);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

const editUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = req.user;
    const userForDB = req.body;
    if (user._id != userId)
      return handleError(
        res,
        403,
        "Forbidden Error: Only the user himself has a permission to update his user details"
      );
    const { error } = registerValidation(userForDB);
    if (error)
      return handleError(res, 400, `Joi Error: ${error.details[0].message}`);
    const normalizeEditUser = await normalizeUser(userForDB);

    const userFromDB = await User.findByIdAndUpdate(userId, normalizeEditUser, {
      new: true,
    });
    if (!userFromDB)
      return handleError(
        res,
        404,
        "Not Found: This user cannot be update because a user with this ID cannot be found in the database"
      );
    res.send(userFromDB);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = req.user;
    if (userId != user._id && !user.isAdmin)
      return handleError(
        res,
        403,
        "Forbidden Error: Only admin user or the user himself has a permission to delete this user account"
      );
    const deletedUserFromDB = await User.findByIdAndDelete(userId);
    if (!deletedUserFromDB)
      return handleError(
        res,
        404,
        "Not Found: This user cannot be delete because a user with this ID cannot be found in the database"
      );
    res.send(deletedUserFromDB);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

exports.register = register;
exports.login = login;
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.changeIsBusinessStatus = changeIsBusinessStatus;
exports.editUser = editUser;
exports.deleteUser = deleteUser;
