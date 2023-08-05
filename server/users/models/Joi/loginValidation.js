const Joi = require("joi");
const { email_regex, password_regex } = require("../../../utils/regexService");

const message = (regex, message, required = true) => {
  if (required)
    return Joi.string()
      .ruleset.regex(regex)
      .rule({ message: message })
      .required();

  return Joi.string().ruleset.regex(regex).rule({ message: message }).allow("");
};

const loginValidation = (user) => {
  const schema = Joi.object({
    email: message(email_regex, 'user "mail" mast be a valid mail'),
    password: message(password_regex, 'user "mail" mast be a valid password'),
  });
  return schema.validate(user);
};

module.exports = loginValidation;
