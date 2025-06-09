const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const protect = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const { uId, isAdmin } = decode;

    const user = await userModel.findOne({ _id: uId, isAdmin });
    if (user === null)
      return res.status(400).send({
        ok: false,
        message: "Account with this token does not exist",
      });

    res.locals.userId = uId;
    res.locals.isAdmin = isAdmin;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};


const adminOnly = (req, res, next) => {
  const { isAdmin } = res.locals;
  if (isAdmin) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
};

module.exports = {
  protect,
  adminOnly
};
