// server.js
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

console.log("=== INICIANDO SERVER.JS DESDE EL CONTENEDOR ===");
app.get('/ping', (req, res) => res.send('pong'));

app.use(express.static(path.join(__dirname, 'dist/frontend-ferreteria/browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/frontend-ferreteria/browser/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor iniciado en http://0.0.0.0:${port}`);
});
