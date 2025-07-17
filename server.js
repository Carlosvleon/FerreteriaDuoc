const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT; // NO uses fallback a 8080

if (!port) throw new Error('PORT environment variable not set');

app.use(express.static(path.join(__dirname, 'dist/frontend-ferreteria/browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/frontend-ferreteria/browser/index.html'));
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
