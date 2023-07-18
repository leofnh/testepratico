const sqlite3 = require('sqlite3').verbose();
const caminhoDb = 'sqlite3.db';
function conectarBd() {
const db = new sqlite3.Database(caminhoDb, sqlite3.OPEN_READWRITE, (err) => {

if (err) {
console.log(err.message);
} else {
console.log('Conectado ao banco de dados sqlite3 com sucesso!');
}

});
return db;
}
module.exports = conectarBd;