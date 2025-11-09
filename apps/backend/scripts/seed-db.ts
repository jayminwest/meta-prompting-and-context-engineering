import db from '../src/db.js';

const products = [
  {
    name: "Wireless Keyboard",
    price: 7999, // $79.99
    description: "Mechanical switches, RGB backlight",
    stock: 50
  },
  {
    name: "Ergonomic Mouse",
    price: 4999,
    description: "Vertical design, wireless",
    stock: 30
  },
  {
    name: "USB-C Hub",
    price: 3999,
    description: "7-in-1, supports 4K",
    stock: 100
  },
  {
    name: "Laptop Stand",
    price: 2999,
    description: "Aluminum, adjustable height",
    stock: 75
  }
];

console.log('Seeding database...');

// Clear existing products
db.prepare('DELETE FROM products').run();

// Insert products
const insert = db.prepare('INSERT INTO products (name, price, description, stock) VALUES (?, ?, ?, ?)');

for (const product of products) {
  insert.run(product.name, product.price, product.description, product.stock);
}

console.log(`✓ Seeded ${products.length} products`);
db.close();
