const jwt = require("jsonwebtoken");

const verify = (req, res, next) => {
  // const myCookie = req.cookie("api_authorization_token");
  // console.log(myCookie)
  const token = req.header("Authorization");

  if (!token) {
    return res.status(403).json({ message: "Access Denied", status: 403 });
  }
  try {
    const verifyToken = jwt.verify(token, process.env.jwt_key);
    req.user = verifyToken;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid Token", error: err.message });
  }
};

module.exports = { verify };
