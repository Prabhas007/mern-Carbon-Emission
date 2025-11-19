// middleware/roles.js
/**
 * authorize(allowedRolesArray)
 * Example: authorize([ROLES.BUSINESS, ROLES.ADMIN])
 */

function authorize(allowed = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const userRoles = req.user.roles || [];
    const permitted = userRoles.some((r) => allowed.includes(r));
    if (!permitted) return res.status(403).json({ message: "Forbidden: insufficient role" });
    next();
  };
}

module.exports = authorize;
