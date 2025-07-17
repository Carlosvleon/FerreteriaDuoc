const serve = require('serve');
const port = process.env.PORT || 8080;
serve('dist/frontend-ferreteria/browser', {
  single: true,
  port: port
});