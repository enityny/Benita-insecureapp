const { getDb } = require('./data/database');

(async () => {
  const db = await getDb();

  db.run("DELETE FROM users");
  db.run("DELETE FROM products");
  db.run("DELETE FROM orders");
  db.run("DELETE FROM feedback");
  db.run("DELETE FROM messages");

  const users = [
    ['admin', 'Admin@123', 'Benita Admin', 'admin@benita.com', 'admin', '/uploads/default-avatar.png', 'Platform administrator', '4111111111111111', '123-45-6789'],
    ['jane', 'jane123', 'Jane Mwangi', 'jane@example.com', 'user', '/uploads/default-avatar.png', 'Fashion lover', '5500000000000004', '987-65-4321'],
    ['peter', 'peter456', 'Peter Kamau', 'peter@example.com', 'user', '/uploads/default-avatar.png', 'Men fashion', '3400000000000009', '456-78-9123'],
    ['grace', 'grace789', 'Grace Akinyi', 'grace@example.com', 'user', '/uploads/default-avatar.png', 'Designer', '3700000000000002', '111-22-3333'],
  ];

  for (const u of users) {
    db.run(`INSERT INTO users (username, password, fullname, email, role, avatar, bio, credit_card, ssn) VALUES ('${u[0]}', '${u[1]}', '${u[2]}', '${u[3]}', '${u[4]}', '${u[5]}', '${u[6]}', '${u[7]}', '${u[8]}')`);
  }

  const products = [
    ['Summer Maxi Dress', 'Elegant floral maxi dress perfect for summer occasions', 4500, 'women', '/uploads/dress1.jpg', 25],
    ['Classic Blazer', 'Premium cotton blend blazer for professional look', 8500, 'men', '/uploads/blazer1.jpg', 15],
    ['Leather Handbag', 'Genuine Italian leather handbag', 12000, 'accessories', '/uploads/bag1.jpg', 10],
    ['Silk Scarf', 'Handwoven silk scarf with traditional patterns', 3200, 'accessories', '/uploads/scarf1.jpg', 40],
    ['Denim Jacket', 'Vintage style denim jacket', 6500, 'women', '/uploads/jacket1.jpg', 20],
    ['Casual Sneakers', 'Comfortable everyday sneakers', 5500, 'men', '/uploads/sneakers1.jpg', 30],
    ['Gold Pendant Necklace', '18k gold plated pendant', 8900, 'accessories', '/uploads/necklace1.jpg', 5],
    ['African Print Shirt', 'Bold Ankara print casual shirt', 3800, 'men', '/uploads/shirt1.jpg', 35],
    ['Evening Gown', 'Floor-length silk evening gown', 25000, 'women', '/uploads/gown1.jpg', 7],
    ['Leather Wallet', 'Slim bifold wallet with RFID protection', 2800, 'accessories', '/uploads/wallet1.jpg', 50],
  ];

  for (const p of products) {
    db.run(`INSERT INTO products (name, description, price, category, image, stock) VALUES ('${p[0]}', '${p[1]}', ${p[2]}, '${p[3]}', '${p[4]}', ${p[5]})`);
  }

  console.log('Database seeded successfully!');
})();
