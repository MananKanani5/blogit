const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../models/users.js");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user)
          return done(null, false, { message: "No user with that username" });

        const isMatch = await user.comparePassword(password);
        if (isMatch) return done(null, user);

        return done(null, false, { message: "Password incorrect" });
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
