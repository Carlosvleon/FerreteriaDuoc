const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.tipo_usuario !== 3) {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
};

module.exports = adminMiddleware;
