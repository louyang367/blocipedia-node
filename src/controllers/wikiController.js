const wikiQueries = require("../db/queries.wikis");
const Authorizer = require("../policies/wiki");
const markdown = require( "markdown" ).markdown;

module.exports = {
  index(req, res, next) {
    wikiQueries.getAllWikis((err, wikis) => {

      if (err) {
        console.log(err);
        req.flash("notice", "Error retrieving public wikis.");
        res.redirect(500, "/");
      } else {
        res.render("wikis/index", { wikis: wikis, authorizer: new Authorizer(req.user, null) });
      }
    })
  },

  myWikis(req, res, next) {
    wikiQueries.getMyWikis(req.user, (err, wikis) => {

      if (err) {
        console.log(err);
        req.flash("notice", "Error retrieving private wikis.");
        res.redirect(500, "/");
      } else {
        res.render("wikis/mywikis", { wikis:wikis, authorizer: new Authorizer(req.user, null) });
      }
    })
  },

  new(req, res, next) {
    const authorizer = new Authorizer(req.user, null);
    if (authorizer.new()) {
      res.render("wikis/new", {authorizer});
    } else {
      req.flash("notice", "You have to be logged in to create new wikis.");
      res.redirect("/wikis");
    }
  },

  create(req, res, next) {
    const authorized = new Authorizer(req.user).create();

    if (authorized) {
      let newWiki = {
        title: req.body.title,
        body: req.body.body,
        userId: req.user.id,
        private: req.body.private
      };
      wikiQueries.addWiki(newWiki, (err, wiki) => {
        if (err) {
          console.log(err)
          req.flash("notice", "Creating wiki failed.");
          res.redirect(500, "/wikis/new");
        } else {
          req.flash("notice", "Wiki added.");
          res.redirect(303, `/wikis/${wiki.id}`);
        }
      });
    } else {
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wikis");
    }
  },

  show(req, res, next) {

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        console.log(err)
        req.flash("notice", "Error retrieving wiki.");
        res.redirect(404, "/");
      } else {
        res.render("wikis/show", { wiki: wiki, markdown: markdown, authorizer: new Authorizer(req.user, wiki) });
      }
    });
  },

  destroy(req, res, next) {

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        console.log(err)
        res.redirect(404, "/");
        return;
      }

      const authorized = new Authorizer(req.user, wiki).destroy();
      if (authorized) {
        wikiQueries.deleteWiki(wiki, (err, wiki) => {
          if (err) {
            console.log(err)
            req.flash("notice", "Deleting wiki failed.");
            res.redirect(err, `/wikis/${req.params.id}`)
          } else {
            req.flash("notice", "Wiki deleted.");
            res.redirect(303, "/wikis")
          }
        })
      } else {
        req.flash("notice", "You are not authorized to do that.")
        res.redirect(401, `/wikis/${req.params.id}`)
      }
    })
  },

  edit(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        res.redirect(404, "/");
      } else {
        const authorized = new Authorizer(req.user, wiki).edit();

        if (authorized) {
          res.render("wikis/edit", { wiki });
        } else {
          req.flash("notice", "You are not authorized to edit.");
          res.redirect(`/wikis/${req.params.id}`)
        }
      }
    });
  },

  update(req, res, next) {

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        console.log(err)
        res.redirect(404, "/");
        return;
      }

      const authorized = new Authorizer(req.user, wiki).update();
      if (authorized) {
        wikiQueries.updateWiki(wiki, req.body, (err, wiki) => {
          if (err) {
            console.log(err)
            req.flash("notice", "Updating wiki failed!");
            res.redirect(404, `/wikis/${req.params.id}/edit`);
          } else {
            req.flash("notice", "Updating wiki succeeded!");
            res.redirect(`/wikis/${wiki.id}`);
          }
        })
      } else {
        req.flash("notice", "You are not authorized to update.")
        res.redirect(401, `/wikis/${req.params.id}`)
      }
    })

  },

  setPrivate(req, res, next) {

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        console.log(err)
        res.redirect(404, "/");
        return;
      }

      const authorized = new Authorizer(req.user, wiki).setPrivate();
      if (!authorized) {
        req.flash("notice", "You have to be the owner or admin to set this wiki private.");
        res.redirect(req.headers.referer);
        return;
      }

      wikiQueries.updateWiki(wiki, { private: true }, (err, wiki) => {
        if (err || wiki == null) {
          if (err) console.log(err)
          req.flash("notice", "Set private failed!");
          res.redirect(404, "/");
        } else {
          req.flash("notice", "Set private succeeded!");
          res.redirect(req.headers.referer);
        }
      })
    })
  },

  setPublic(req, res, next) {

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        console.log(err)
        res.redirect(404, "/");
        return;
      }

      const authorized = new Authorizer(req.user, wiki).setPublic();
      if (!authorized) {
        req.flash("notice", "You have to be the owner or admin to set this wiki private.");
        res.redirect(req.headers.referer);
        return;
      }

      wikiQueries.updateWiki(wiki, { private: false }, (err, wiki) => {
        if (err || wiki == null) {
          if (err) console.log(err)
          req.flash("notice", "Set public failed!");
          res.redirect(404, "/");
        } else {
          req.flash("notice", "Set public succeeded!");
          res.redirect(req.headers.referer);
        }
      })
    })
  }

}