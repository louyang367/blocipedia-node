const User = require("./models").User;
const bcrypt = require("bcryptjs");

module.exports = {
  createUser(newUser, callback) {

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    return User.create({
      name: newUser.name,
      email: newUser.email,
      password: hashedPassword,
      role: User.STANDARD
    })
      .then((user) => {
        callback(null, user);
      })
      .catch((err) => {
        callback(err);
      })
  },

  updateUser(req, updatedUser, callback) {
    if (!req.user) {
      return callback("User not found");
    }

    return req.user.update(updatedUser, {
      fields: Object.keys(updatedUser)
    })
      .then((user) => {
        callback(null, user);
      })
      .catch((err) => {
        callback(err);
      });
  },

  upgradeDowngrade(req, newRole, callback) {

    if (!req.user) {
      return callback("User not found");
    }

    return req.user.update({ 'role': newRole })
      .then((user) => {
        callback(null, user);
      })
      .catch((err) => {
        callback(err);
      });
  }

}
