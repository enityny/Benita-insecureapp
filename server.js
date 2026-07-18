const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { getDb } = require('./data/database');

const app = express();
const upload = multer({ dest: path.join(__dirname, 'public/uploads') });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'benita-secret-key-2024',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).render('error', { message: 'Access denied' });
  next();
}

let db;

const ready = getDb().then(d => { db = d; }).catch(e => { console.error('DB init failed:', e); process.exit(1); });

app.get('/', (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const products = db.all("SELECT * FROM products");
    const featured = products ? products.slice(0, 4) : [];
    res.render('index', { products: featured });
  } catch (e) { res.status(500).send('Error'); }
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  const { username, password } = req.body;
  try {
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    const user = db.get(query);
    if (!user) return res.render('login', { error: 'Invalid credentials' });
    req.session.user = user;
    res.redirect(user.role === 'admin' ? '/dashboard' : '/shop');
  } catch (e) {
    res.status(500).send('Error');
  }
});

app.get('/shop', requireAuth, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    let category = req.query.category || '';
    let products;
    if (category) {
      products = db.all(`SELECT * FROM products WHERE category = '${category}'`);
    } else {
      products = db.all("SELECT * FROM products");
    }
    const categories = db.all("SELECT DISTINCT category FROM products");
    res.render('shop', { products, categories });
  } catch (e) { res.status(500).send('Error'); }
});

app.get('/product', requireAuth, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const id = req.query.id || 0;
    const product = db.get(`SELECT * FROM products WHERE id = ${id}`);
    if (!product) return res.status(404).send('Product not found');
    res.render('product', { product });
  } catch (e) { res.status(500).send('Error'); }
});

app.get('/profile', requireAuth, (req, res) => {
  res.render('profile', { user: req.session.user, updated: null });
});

app.post('/profile', requireAuth, upload.single('avatar'), (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const { fullname, bio } = req.body;
    let avatar = req.session.user.avatar;
    if (req.file) avatar = '/uploads/' + req.file.filename;
    db.run(`UPDATE users SET fullname='${fullname}', bio='${bio}', avatar='${avatar}' WHERE id=${req.session.user.id}`);
    req.session.user.fullname = fullname;
    req.session.user.bio = bio;
    req.session.user.avatar = avatar;
    res.render('profile', { user: req.session.user, updated: 'Profile updated' });
  } catch (e) { res.status(500).send('Error'); }
});

app.post('/profile/avatar-url', requireAuth, (req, res) => {
  const avatarUrl = req.body.avatar_url;
  if (!avatarUrl) return res.redirect('/profile');
  http.get(avatarUrl, (response) => {
    let data = '';
    response.on('data', (chunk) => data += chunk);
    response.on('end', () => {
      const filename = 'avatar_' + req.session.user.id + '.jpg';
      const filepath = path.join(__dirname, 'public/uploads', filename);
      fs.writeFile(filepath, data, (err) => {
        if (err) return res.redirect('/profile');
        req.session.user.avatar = '/uploads/' + filename;
        if (db) db.run(`UPDATE users SET avatar='${req.session.user.avatar}' WHERE id=${req.session.user.id}`);
        res.redirect('/profile');
      });
    });
  }).on('error', () => res.redirect('/profile'));
});

app.get('/users', requireAuth, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const id = req.query.id || req.session.user.id;
    const user = db.get(`SELECT * FROM users WHERE id = ${id}`);
    if (!user) return res.status(404).send('User not found');
    res.render('user-profile', { profile: user });
  } catch (e) { res.status(500).send('Error'); }
});

app.get('/dashboard', requireAuth, requireAdmin, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const users = db.all("SELECT * FROM users");
    const orders = db.all("SELECT * FROM orders");
    res.render('admin-dashboard', { users, orders });
  } catch (e) { res.status(500).send('Error'); }
});

app.get('/orders', requireAuth, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const orders = db.all(`SELECT o.*, p.name as product_name FROM orders o JOIN products p ON o.product_id = p.id WHERE o.user_id = ${req.session.user.id}`);
    res.render('orders', { orders });
  } catch (e) { res.status(500).send('Error'); }
});

app.post('/orders', requireAuth, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const { product_id, quantity, credit_card } = req.body;
    db.run(`INSERT INTO orders (user_id, product_id, quantity, credit_card) VALUES (${req.session.user.id}, ${product_id}, ${quantity}, '${credit_card}')`);
    res.redirect('/orders');
  } catch (e) { res.status(500).send('Error'); }
});

app.get('/feedback', requireAuth, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const feedbacks = db.all("SELECT f.*, u.username FROM feedback f JOIN users u ON f.user_id = u.id");
    res.render('feedback', { feedbacks });
  } catch (e) { res.status(500).send('Error'); }
});

app.post('/feedback', requireAuth, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const { message, rating } = req.body;
    db.run(`INSERT INTO feedback (user_id, message, rating) VALUES (${req.session.user.id}, '${message}', ${rating})`);
    res.redirect('/feedback');
  } catch (e) { res.status(500).send('Error'); }
});

app.get('/messages', requireAuth, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const messages = db.all(`SELECT * FROM messages WHERE to_user = ${req.session.user.id} OR from_user = ${req.session.user.id}`);
    res.render('messages', { messages });
  } catch (e) { res.status(500).send('Error'); }
});

app.post('/messages', requireAuth, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const { to_username, message } = req.body;
    const target = db.get(`SELECT id FROM users WHERE username = '${to_username}'`);
    if (!target) return res.redirect('/messages');
    db.run(`INSERT INTO messages (from_user, to_user, message) VALUES (${req.session.user.id}, ${target.id}, '${message}')`);
    res.redirect('/messages');
  } catch (e) { res.status(500).send('Error'); }
});

app.get('/admin-panel', requireAuth, requireAdmin, (req, res) => {
  res.render('admin-panel');
});

app.post('/admin-panel/backup', requireAuth, requireAdmin, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const users = db.all("SELECT * FROM users");
    const backupPath = path.join(__dirname, 'public', 'backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(users, null, 2));
    res.download(backupPath);
  } catch (e) { res.status(500).send('Error'); }
});

app.post('/admin-panel/export', requireAuth, requireAdmin, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const { table } = req.body;
    const data = db.all(`SELECT * FROM ${table}`);
    res.json(data);
  } catch (e) { res.status(500).send('Error'); }
});

app.get('/.env', (req, res) => {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    res.type('text/plain').send(fs.readFileSync(envPath, 'utf8'));
  } else {
    res.status(404).send('File not found');
  }
});

app.get('/search', requireAuth, (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const q = req.query.q || '';
    const results = db.all(`SELECT * FROM products WHERE name LIKE '%${q}%' OR description LIKE '%${q}%'`);
    res.render('search', { results, query: q });
  } catch (e) { res.status(500).send('Error'); }
});

app.post('/reset-password', (req, res) => {
  if (!db) return res.status(503).send('Initializing...');
  try {
    const { username, new_password } = req.body;
    db.run(`UPDATE users SET password = '${new_password}' WHERE username = '${username}'`);
    res.render('login', { error: null, message: 'Password reset successfully' });
  } catch (e) { res.status(500).send('Error'); }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

const PORT = process.env.PORT || 3000;

ready.then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('Benita App running on port ' + PORT);
  });
});
