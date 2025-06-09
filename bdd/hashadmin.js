// generarHash.js
const bcrypt = require('bcrypt');

const password = 'admin123'; // aquí la contraseña que quieres hashear
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) throw err;
  console.log('El hash generado es:');
  console.log(hash);
});


//ejecturar parar generar hash admin "node hashadmin.js"