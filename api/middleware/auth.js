const jwt = require("jsonwebtoken");
const tokenKey = require("../../config/keys").secretOrKey;
let store = require("store");
module.exports = {
  verifyToken: (req, res, next) => {
    jwt.verify(store.get("token"), tokenKey, function(err, authorizedData) {
      if (err) console.log(err);
      if (authorizedData) {
        req.data = authorizedData;
        return next();
      } else {
        res.sendStatus(403);
      }
    });
  }
};
