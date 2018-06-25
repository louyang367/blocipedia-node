const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const sgMail = require('@sendgrid/mail');

module.exports = {
  signup(req, res, next) {
    res.render("users/signup");
  },

  create(req, res, next) {
    let newUser = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };
    userQueries.createUser(newUser, (err, user) => {
      if (err) {
        console.log(err);
        req.flash("error", [{ param: err.errors[0].type, msg: err.errors[0].message }]);
        res.redirect(303, req.headers.referer);
      } else {

        passport.authenticate("local")(req, res, () => {
          req.flash("notice", "You've successfully signed in!");

          //sendgrid
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          const msg = {
            to: newUser.email,
            from: 'louyang367@gmail.com',
            subject: 'Thank you for registering with Blocipedia!',
            text: `Your user name is ${newUser.name}, email: ${newUser.email}`,
            html: '<a href="louyang367-blocipedia.heroku.com">Visit us here</a>',
          };
          sgMail.send(msg).then(() => {
            console.log('email sent')
          })
            .catch(error => {

              //Log friendly error
              console.error(error.toString());
              //Extract error msg
              const { message, code, response } = error;
              //Extract response msg
              const { headers, body } = response;
              console.log(headers, body)
            });

          res.redirect("/");
        })
      }
    });
  }

}