module.exports = (req, res, next) => {
  // Acepta tipo_usuario_id o tipo_usuario (por compatibilidad)
  const tipo = req.user.tipo_usuario_id ;
  if (tipo === 1) {
    return next();
  } else {
    return res.status(403).json({ error: 'Acceso solo para administradores.' });
  }
};