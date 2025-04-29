import dotenv from 'dotenv';
import connection from './services/connection.js';

dotenv.config();

const alertQueue = 'price_alert_queue';
const exchange = 'processExchange';


const notifyPriceChange = async (messageData) => {
  const { productName, previousPrice, currentPrice, differencePercentage } = messageData; 

  if (!productName || typeof previousPrice !== 'number' || typeof currentPrice !== 'number') {
    console.error('Mensagem inválida:', messageData);
    return;
  }

  console.log(`Notificação: O preço do produto "${productName}" foi alterado de R$${previousPrice} para R$${currentPrice}. Diferença: ${differencePercentage}%`);
};

connection(alertQueue, exchange, alertQueue, notifyPriceChange);
