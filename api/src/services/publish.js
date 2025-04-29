import amqp from 'amqplib';
import { v4 } from 'uuid';

const exchange = 'processExchange';
const routingKeys = {
  monitor: ['product_monitoring_queue', 'price_history_queue'], 
};

export default async (eventType, data) => {
    let connection;
    try {
        connection = await amqp.connect(process.env.RABBIT_MQ);
        const channel = await connection.createChannel();

        await channel.assertExchange(exchange, 'direct', { durable: true });

        const message = {
            eventType,
            version: "1.0",
            producer: "api",
            timestamp: new Date(),
            correlationId: v4(),
            data,
        };

        const keys = routingKeys[eventType] || ['defaultQueue'];

        for (const key of keys) {
            channel.publish(exchange, key, Buffer.from(JSON.stringify(message)));
        }

        await channel.close();
    } catch (error) {
        throw new Error(`Error publishing message: ${error.message}`);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};
