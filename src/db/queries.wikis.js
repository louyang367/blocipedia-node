const Wiki = require("./models").Wiki;
const User = require("./models").User;

module.exports = {
  getAllWikis(callback) {
    return Wiki.all({where: {private: false}})
      .then((wikis) => {
        callback(null, wikis);
      })
      .catch((err) => {
        callback(err);
      })
  },

  getMyWikis(user, callback) {
    let option={};
    if (user.role==User.ADMIN) option = {private: true};
    else option = {userId: user.id, private: true};

    return Wiki.all({where: option})
      .then((wikis) => {
        callback(null, wikis);
      })
      .catch((err) => {
        callback(err);
      })
  },

  addWiki(newWiki, callback) {
    return Wiki.create({
      title: newWiki.title,
      body: newWiki.body,
      userId: newWiki.userId,
      private: newWiki.private
    })
      .then((wiki) => {
        callback(null, wiki);
      })
      .catch((err) => {
        callback(err);
      })
  },

  getWiki(id, callback) {
    return Wiki.findById(id, {
      include: [{
        model: User,
        as: "User"
      }]
    })
      .then((wiki) => {
        callback(null, wiki);
      })
      .catch((err) => {
        callback(err);
      })
  },

  deleteWiki(wiki, callback) {
    return wiki.destroy()
      .then((res) => {
        callback(null, wiki);
      })
      .catch((err) => {
        callback(err);
      });
  },

  updateWiki(wiki, updatedWiki, callback) {
    return wiki.update(updatedWiki, {
      fields: Object.keys(updatedWiki)
    })
      .then(() => {
        callback(null, wiki);
      })
      .catch((err) => {
        callback(err);
      });
  }

}