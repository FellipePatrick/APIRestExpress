const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'animals.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS animals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      species TEXT NOT NULL
    )
  `);
});

app.post('/animals', (req, res) => {
  const { name, species } = req.body;
  const stmt = db.prepare('INSERT INTO animals (name, species) VALUES (?, ?)');
  stmt.run(name, species, function(err) {
    if (err) return res.status(500).send(err.message);
    res.status(201).send({ id: this.lastID, name, species });
  });
  stmt.finalize();
});

app.get('/animals', (req, res) => {
  db.all('SELECT * FROM animals', (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.send(rows);
  });
});

app.get('/animals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.get('SELECT * FROM animals WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (!row) return res.status(404).send({ message: 'Animal not found' });
    res.send(row);
  });
});

app.put('/animals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, species } = req.body;
  const stmt = db.prepare('UPDATE animals SET name = ?, species = ? WHERE id = ?');
  stmt.run(name, species, id, function(err) {
    if (err) return res.status(500).send(err.message);
    if (this.changes === 0) return res.status(404).send({ message: 'Animal not found' });
    res.send({ id, name, species });
  });
  stmt.finalize();
});

app.delete('/animals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const stmt = db.prepare('DELETE FROM animals WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) return res.status(500).send(err.message);
    if (this.changes === 0) return res.status(404).send({ message: 'Animal not found' });
    res.status(204).send();
  });
  stmt.finalize();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
