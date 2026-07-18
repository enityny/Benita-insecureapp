const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'benita.db');

async function getDb() {
  const SQL = await initSqlJs();
  let db;
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    fullname TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    avatar TEXT,
    bio TEXT,
    credit_card TEXT,
    ssn TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    category TEXT,
    image TEXT,
    stock INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    status TEXT DEFAULT 'pending',
    credit_card TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT,
    rating INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user INTEGER,
    to_user INTEGER,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const save = () => {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  };

  const parseResult = (result) => {
    if (!result || result.length === 0) return [];
    const { columns, values } = result[0];
    if (!values) return [];
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  };

  return {
    all: (sql) => {
      try {
        const result = db.exec(sql);
        save();
        return parseResult(result);
      } catch (e) { throw e; }
    },
    get: (sql) => {
      try {
        const result = db.exec(sql);
        save();
        const rows = parseResult(result);
        return rows.length > 0 ? rows[0] : null;
      } catch (e) { throw e; }
    },
    run: (sql) => {
      try {
        db.run(sql);
        save();
      } catch (e) { throw e; }
    }
  };
}

module.exports = { getDb };
