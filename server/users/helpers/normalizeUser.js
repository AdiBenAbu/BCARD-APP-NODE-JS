const { generateUserPassword } = require("./bcrypt");

const normalizeUser = (rawUser) => {
  const name = {
    ...rawUser.name,
    middle: rawUser.name.middle || "",
  };

  const image = {
    url:
      rawUser.image.url ||
      "https://cdn.pixabay.com/photo/2016/04/20/08/21/entrepreneur-1340649_960_720.jpg",
    alt: rawUser.image.alt || "Business card image",
  };

  const address = {
    ...rawUser.address,
    state: rawUser.address.state || "",
  };

  return {
    ...rawUser,
    name,
    image,
    address,
    password: generateUserPassword(rawUser.password),
  };
};

module.exports = normalizeUser;
