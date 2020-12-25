/* Set up login google with lib passportjs */
const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.serializeUser(function(user, done) {
    /*
    From the user take just the id (to minimize the cookie size) and just pass the id of the user
    to the done callback
    PS: You dont have to do it like this its just usually done like this
    */
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    /*
    Instead of user this function usually recives the id 
    then you use the id to select the user from the db and pass the user obj to the done callback
    PS: You can later access this data in any routes in: req.user
    */
    done(null, user);
});
const CLIENT_GOOGLE_ID =
  "724105770178-hn6h9j3k7auik6l7dun2qtuom1qa5aau.apps.googleusercontent.com";
const CLIENT_GOOGLE_SECRET = "G3JxBK88oGbPtc7KBaY1Am56";
passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_GOOGLE_ID,
      clientSecret: CLIENT_GOOGLE_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      console.log(accessToken);
      console.log(refreshToken);
      return done(null, profile)
    }
  )
);
