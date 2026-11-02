const bcrypt = require('bcrypt');

const PasswordHash = {
  hash: async (password) => {
    const saltRound = 10;
    return bcrypt.hash(password, saltRound);
  },
  compare: async (password, hashedPassword) => bcrypt.compare(password, hashedPassword),
};

module.exports = PasswordHash;
