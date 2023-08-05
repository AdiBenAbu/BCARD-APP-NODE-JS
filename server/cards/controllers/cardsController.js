const { handleError } = require("../../utils/handleErrors");
const normalizeCard = require("../helpers/normalizeCard");
const validateCard = require("../models/joi/validateCard");
const Card = require("../models/mongoose/Card");
const lodash = require("lodash");
const validateBizNumber = require("../models/joi/validateBizNumber");

const createCard = async (req, res) => {
  try {
    const card = req.body;
    const user = req.user;

    if (!user.isBusiness)
      return handleError(
        res,
        403,
        "Forbidden Error: Only business user in order to create a new business card"
      );

    const { error } = validateCard(card);
    if (error)
      return handleError(res, 400, `Joi Error: ${error.details[0].message}`);

    const normalizedCard = await normalizeCard(card, user._id);

    const cardToDB = new Card(normalizedCard);
    const cardFromDB = await cardToDB.save();
    res.send(cardFromDB);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

const getCards = async (req, res) => {
  try {
    const cards = await Card.find().sort({ createdAt: "ascending" });
    if (!cards)
      return handleError(
        res,
        404,
        "Not Found: Cards cannot be found in the database"
      );
    res.send(cards);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

const getMyCards = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return handleError(
        res,
        403,
        "Forbidden Error: This user has not permission to access my cards"
      );
    const cards = await Card.find({ user_id: user._id });
    if (!cards)
      return handleError(
        res,
        404,
        "Not Found: Cards of this user cannot be found in the database"
      );
    res.send(cards);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

const getCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId);
    if (!card)
      return handleError(
        res,
        404,
        "Not Found: This card cannot be found in the database"
      );
    res.send(card);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

const editCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const user = req.user;
    const card = req.body;

    if (user._id != card.user_id)
      return handleError(
        res,
        403,
        "Forbidden Error: Only user who created this card in order to edit a business card"
      );

    const { error } = validateCard(card);
    if (error)
      return handleError(res, 400, `Joi Error: ${error.details[0].message}`);
    const normalizeEditCard = await normalizeCard(card);
    const cardFromDB = await Card.findByIdAndUpdate(cardId, normalizeEditCard, {
      new: true,
    });
    if (!cardFromDB)
      return handleError(
        res,
        404,
        "Not Found: This card cannot update because a card with this ID cannot be found in the database"
      );
    res.send(cardFromDB);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

const likeCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const user = req.user;

    if (!user)
      return handleError(
        res,
        403,
        "Forbidden Error: Only user account can like cards"
      );

    let card = await Card.findById(cardId);
    if (!card)
      return handleError(
        res,
        404,
        "Not Found: This card cannot get likes because a card with this ID cannot be found in the database"
      );
    const cardLikes = card.likes.find((id) => id === user._id);
    if (!cardLikes) {
      card.likes.push(user._id);
      card = await card.save();
      return res.send(card);
    }
    const index = card.likes.indexOf(user._id);
    card.likes.splice(index, 1);
    card = await card.save();
    return res.send(card);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const user = req.user;

    let card = await Card.findById(cardId);
    if (!card)
      return handleError(
        res,
        404,
        "Not Found: This card cannot delete because a card with this ID cannot be found in the database"
      );
    if (card.user_id != user._id && !user.isAdmin)
      return handleError(
        res,
        403,
        "Forbidden Error: Only admin user or the user who created the card in order to delete a business card"
      );
    const deletedCardFromDB = await Card.findByIdAndDelete(cardId);
    res.send(deletedCardFromDB);
  } catch (error) {
    return handleError(res, 500, `Mongoose Error: ${error.message}`);
  }
};

const changeBizNumber = async (req, res) => {
  try {
    const { cardId } = req.params;
    const user = req.user;
    const { bizNumber } = req.body;
    if (!user.isAdmin)
      return handleError(
        res,
        403,
        "Forbidden Error: Only Admin user in order to change business number"
      );

    const { error } = validateBizNumber(bizNumber);
    if (error)
      return handleError(res, 400, `Joi Error: ${error.details[0].message}`);

    const isBizNumExists = await Card.findOne(
      { bizNumber },
      { bizNumber: 1, _id: 0 }
    );
    if (isBizNumExists)
      return handleError(
        res,
        409,
        "Authentication Error: A card with this Business number already exists"
      );

    const card = await Card.findByIdAndUpdate(
      cardId,
      { bizNumber },
      { new: true }
    );
    if (!card)
      return handleError(
        res,
        404,
        "Not Found: A card with this ID cannot be found in the database"
      );
    return res.send(card);
  } catch (error) {
    return handleError(res, 404, `Mongoose Error: ${error.message}`);
  }
};

exports.createCard = createCard;
exports.getCards = getCards;
exports.getMyCards = getMyCards;
exports.getCard = getCard;
exports.editCard = editCard;
exports.likeCard = likeCard;
exports.deleteCard = deleteCard;
exports.changeBizNumber = changeBizNumber;
