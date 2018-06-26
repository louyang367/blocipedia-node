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
        res.redirect(req.headers.referer);
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
  },

  loginForm(req, res, next){
    res.render("users/login");
  },

  login(req, res, next){
    // passport.authenticate("local", { 
    //   failureRedirect: '/users/login', 
    //   failureFlash: true,
    //   successRedirect: '/',
    //   successFlash: "You've successfully signed in!"
    // });
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { 
        req.flash("notice", info.message);
        return res.redirect('/users/login'); 
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        req.flash("notice", "You've successfully signed in!");
        return res.redirect('/');
      });
    })(req, res, next);
  
    // , (req, res, function () {
    //   console.log('----------In login')
    //   if(!req.user){
    //     req.flash("notice", "Sign in failed. Please try again.")
    //     //res.redirect(303,req.headers.referer);
    //     res.redirect("/users/login");
    //   } else {
    //     req.flash("notice", "You've successfully signed in!");
    //     res.redirect("/");
    //   }
    // });
    //next();
  },

  logout(req, res, next){
    req.logout();
    req.flash("notice", "You've successfully logged out!");
    res.redirect("/");
  }

}