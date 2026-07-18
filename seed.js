const { getDb } = require('./data/database');

(async () => {
  const db = await getDb();

  db.run("DELETE FROM users");
  db.run("DELETE FROM products");
  db.run("DELETE FROM orders");
  db.run("DELETE FROM feedback");
  db.run("DELETE FROM messages");

  const users = [
    ['admin', 'Admin@123', 'Benita Admin', 'admin@benita.com', 'admin', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format', 'Platform administrator', '4111111111111111', '123-45-6789'],
    ['jane', 'jane123', 'Jane Mwangi', 'jane@example.com', 'user', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format', 'Fashion lover', '5500000000000004', '987-65-4321'],
    ['peter', 'peter456', 'Peter Kamau', 'peter@example.com', 'user', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format', 'Men fashion', '3400000000000009', '456-78-9123'],
    ['grace', 'grace789', 'Grace Akinyi', 'grace@example.com', 'user', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format', 'Designer', '3700000000000002', '111-22-3333'],
  ];

  for (const u of users) {
    db.run(`INSERT INTO users (username, password, fullname, email, role, avatar, bio, credit_card, ssn) VALUES ('${u[0]}', '${u[1]}', '${u[2]}', '${u[3]}', '${u[4]}', '${u[5]}', '${u[6]}', '${u[7]}', '${u[8]}')`);
  }

  const products = [
    ['Summer Maxi Dress', 'Elegant floral maxi dress perfect for summer occasions', 4500, 'women', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop&auto=format', 25],
    ['Classic Blazer', 'Premium cotton blend blazer for professional look', 8500, 'men', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop&auto=format', 15],
    ['Leather Handbag', 'Genuine Italian leather handbag', 12000, 'accessories', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&auto=format', 10],
    ['Silk Scarf', 'Handwoven silk scarf with traditional patterns', 3200, 'accessories', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop&auto=format', 40],
    ['Denim Jacket', 'Vintage style denim jacket', 6500, 'women', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format', 20],
    ['Casual Sneakers', 'Comfortable everyday sneakers', 5500, 'men', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format', 30],
    ['Gold Pendant Necklace', '18k gold plated pendant', 8900, 'accessories', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop&auto=format', 5],
    ['African Print Shirt', 'Bold Ankara print casual shirt', 3800, 'men', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=400&fit=crop&auto=format', 35],
    ['Evening Gown', 'Floor-length silk evening gown', 25000, 'women', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop&auto=format', 7],
    ['Leather Wallet', 'Slim bifold wallet with RFID protection', 2800, 'accessories', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop&auto=format', 50],
  ];

  for (const p of products) {
    db.run(`INSERT INTO products (name, description, price, category, image, stock) VALUES ('${p[0]}', '${p[1]}', ${p[2]}, '${p[3]}', '${p[4]}', ${p[5]})`);
  }

  console.log('Database seeded successfully!');
})();
