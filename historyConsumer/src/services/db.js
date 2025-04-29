import knex from 'knex';
import { resolve } from 'path';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: resolve('database.sqlite'),
  },
  useNullAsDefault: true,
});

const initDB = async () => {
  const hasProducts = await db.schema.hasTable('products');
  if (!hasProducts) {
    await db.schema.createTable('products', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('ecommerce').notNullable();
      table.unique(['name', 'ecommerce']); 
    });
    console.log('✅ Tabela "products" criada');
  }

  const hasHistory = await db.schema.hasTable('price_history');
  if (!hasHistory) {
    await db.schema.createTable('price_history', (table) => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
      table.decimal('price', 10, 2).notNullable();
      table.timestamp('timestamp').defaultTo(db.fn.now());
    });
    console.log('✅ Tabela "price_history" criada');
  }
};

await initDB();
export default db;
