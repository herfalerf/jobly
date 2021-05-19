"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

// Middleware to use when they must be the same user as the profile they are trying to access/modify/delete.

function ensureCorrectUser(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    if (req.params.username === res.locals.user.username) {
      console.log("The usernames match");
      res.locals.match = true;
      return next();
    } else {
      res.locals.match = false;
      console.log("the usernames do not match");
      return next();
    }
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be an admin.  Will check if correct user condition has been set/met prior to checking for admin.
 *
 * IF not, raises Unauthorized
 */
function ensureIsAdmin(req, res, next) {
  try {
    console.log(res.locals);
    if (res.locals.match === true) return next();
    if (!res.locals.user) throw new UnauthorizedError();
    if (!res.locals.user.isAdmin) throw new UnauthorizedError();
    console.log(`user ${res.locals.user.username} is an Admin`);
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureIsAdmin,
};
