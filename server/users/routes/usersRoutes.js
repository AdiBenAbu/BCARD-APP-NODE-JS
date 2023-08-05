const express = require("express");
const {
  register,
  login,
  getUsers,
  getUser,
  changeIsBusinessStatus,
  editUser,
  deleteUser,
} = require("../controllers/usersController");
const auth = require("../../auth/authServices");
const router = express.Router();

router.post("/", register);
router.post("/login", login);
router.get("/", auth, getUsers);
router.get("/:userId", auth, getUser);
router.patch("/:userId", auth, changeIsBusinessStatus);
router.put("/:userId", auth, editUser);
router.delete("/:userId", auth, deleteUser);

module.exports = router;
