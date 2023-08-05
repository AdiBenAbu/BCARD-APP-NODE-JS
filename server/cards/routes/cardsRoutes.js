const express = require("express");
const {
  createCard,
  getCards,
  getMyCards,
  getCard,
  editCard,
  likeCard,
  deleteCard,
  changeBizNumber,
} = require("../controllers/cardsController");
const auth = require("../../auth/authServices");
const router = express.Router();

router.post("/", auth, createCard);
router.get("/", getCards);
router.get("/my-cards", auth, getMyCards);
router.get("/:cardId", getCard);
router.put("/:cardId", auth, editCard);
router.patch("/:cardId", auth, likeCard);
router.delete("/:cardId", auth, deleteCard);
router.put("/changeBizNumber/:cardId", auth, changeBizNumber);

module.exports = router;
