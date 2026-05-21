module.exports = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message:
            "Cảnh báo bảo mật: Bạn không có quyền thực hiện hành động này.",
        });
    }
    next();
  };
};
