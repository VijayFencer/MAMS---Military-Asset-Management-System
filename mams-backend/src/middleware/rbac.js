export const permit = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const role = req.user.role || req.user.roleName || req.user.roleId;
    if (!allowedRoles.length) return next();
    if (allowedRoles.includes(role)) return next();
    
    return res.status(403).json({ error: "Forbidden" });
  };
};
