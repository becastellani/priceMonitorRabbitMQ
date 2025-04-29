import amqp from 'amqplib';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import connection from './services/connection.js';

dotenv.config();

const monitoringQueue = 'product_monitoring_queue';
const alertQueue = 'price_alert_queue';
const exchange = 'processExchange';
const jsonFilePath = './product_prices.json';

const readProductPrices = async () => {
  try {
    const data = await fs.readFile(jsonFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

const saveProductPrices = async (prices) => {
  await fs.writeFile(jsonFilePath, JSON.stringify(prices, null, 2));
};

const monitorPrice = async (messageData, channel) => {
  const { name, price } = messageData.data.data; 

  if (!name || typeof price !== 'number') {
    console.error('Mensagem inválida:', messageData);
    return;
  }

  const prices = await readProductPrices();
  const previousPrice = prices[name];
  if (previousPrice !== undefined) {
    const priceDifference = Math.abs(price - previousPrice) / previousPrice;

    if (priceDifference > 0.10) {
      console.log(`Preço alterado para o produto "${name}": ${previousPrice} -> ${price}`);

      const alertMessage = {
        productName: name,
        previousPrice,
        currentPrice: price,
        differencePercentage: (priceDifference * 100).toFixed(2),
      };

      await channel.assertQueue(alertQueue, { durable: true });
      channel.sendToQueue(alertQueue, Buffer.from(JSON.stringify(alertMessage)), { persistent: true });
    }
  }

  prices[name] = price;
  await saveProductPrices(prices);
};

const startMonitoring = async () => {
  const conn = await amqp.connect(process.env.RABBIT_MQ);
  const channel = await conn.createChannel();

  await channel.assertExchange(exchange, 'direct', { durable: true });
  await channel.assertQueue(monitoringQueue, { durable: true });
  await channel.bindQueue(monitoringQueue, exchange, monitoringQueue);

  console.log(` [*] Aguardando mensagens na fila "${monitoringQueue}". Para sair, pressione CTRL+C`);

  channel.consume(monitoringQueue, async (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      await monitorPrice(content, channel);
      channel.ack(msg);
    }
  });
};

startMonitoring().catch(console.error);
