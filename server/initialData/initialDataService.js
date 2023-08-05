const normalizeCard = require("../cards/helpers/normalizeCard");
const validateCard = require("../cards/models/joi/validateCard");
const Card = require("../cards/models/mongoose/Card");
const normalizeUser = require("../users/helpers/normalizeUser");
const registerValidation = require("../users/models/Joi/registerValidation");
const User = require("../users/models/mongoose/User");
const data = require("./initialData.json");
const chalk = require("chalk");

const generateInitialCards = async () => {
  const { cards } = data;
  const userId = "649d4633d35817dcf30985fb";
  cards.forEach(async (card) => {
    try {
      const { error } = validateCard(card);
      if (error) throw new Error(`Joi Error: ${error.details[0].message}`);
      const normalizedCard = await normalizeCard(card, userId);
      const cardToDB = new Card(normalizedCard);
      await cardToDB.save();
      console.log(
        chalk.greenBright(`Generate card '${card.title}' successfully`)
      );
    } catch (error) {
      return console.log(
        chalk.redBright(`Initial Data Generate Card Error: ${error.message}`)
      );
    }
  });
};

const generateInitialUsers = async () => {
  const { users } = data;

  users.forEach(async (user) => {
    try {
      const { email } = user;
      const { error } = registerValidation(user);
      if (error) throw new Error(`Joi Error: ${error.details[0].message}`);
      const UserExistInDB = await User.findOne({ email });
      if (UserExistInDB) throw new Error(`User is already registered`);
      const normalizeUsers = normalizeUser(user);
      const userToDB = new User(normalizeUsers);
      await userToDB.save();
      console.log(
        chalk.greenBright(
          `Generate user '${
            user.name.first + " " + user.name.last
          }' successfully`
        )
      );
    } catch (error) {
      chalk.redBright(`Initial Data Generate User Error: ${error.message}`);
    }
  });
};

exports.generateInitialCards = generateInitialCards;
exports.generateInitialUsers = generateInitialUsers;
