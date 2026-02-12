module.exports = (role) => (req, res, next) => {
  const user = req.session && req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  if (user.role !== role) {
    if (user.role === "teacher") return res.redirect("/teacher");
    if (user.role === "student") return res.redirect("/student");
    return res.status(403).send("Forbidden");
  }

  next();
};