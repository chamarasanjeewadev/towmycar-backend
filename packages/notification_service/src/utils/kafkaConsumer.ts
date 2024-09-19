import { Kafka } from 'kafkajs';
import { processBreakdownRequest } from '../services/notificationService';

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: ['localhost:9092'], // Update with your Kafka broker addresses
});

const consumer = kafka.consumer({ groupId: 'notification-service-group' });

export async function startKafkaConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'breakdown-requests', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log('Received message:', {
        topic,
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });

      if (message.value) {
        const breakdownRequest = JSON.parse(message.value.toString());
        await processBreakdownRequest(breakdownRequest);
      }
    },
  });
}

export async function stopKafkaConsumer() {
  await consumer.disconnect();
}