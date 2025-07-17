const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'dist/frontend-ferreteria/browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/frontend-ferreteria/browser/index.html'));
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
