import dotenv from 'dotenv';
import connection from './services/connection.js';
import db from './services/db.js';

dotenv.config();

const queue = 'price_history_queue';
const exchange = 'processExchange';

const salvarHistorico = async (message) => {
  const { name, price, ecommerce, url } = message.data.data;

  if (!name || typeof price !== 'number' || !ecommerce) {
    console.error('Dados inválidos recebidos:', message);
    return;
  }

  try {
    let product = await db('products')
      .where({ name, ecommerce })
      .first();

    if (!product) {
      const [id] = await db('products').insert({ name, ecommerce, url });
      product = { id };
      console.log(`Produto cadastrado: ${name} (${ecommerce})`);
    }

    await db('price_history').insert({
      product_id: product.id,
      price,
    });

    console.log(`Histórico salvo: ${name} - R$${price} (${ecommerce})`);
  } catch (error) {
    console.error('Erro ao salvar no banco:', error.message);
  }
};

connection(queue, exchange, queue, salvarHistorico);
