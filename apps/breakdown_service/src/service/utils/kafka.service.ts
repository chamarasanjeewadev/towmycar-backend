import { Kafka } from 'kafkajs';

// Initialize Kafka client
const kafka = new Kafka({
  clientId: 'breakdown-service',
  brokers: ['localhost:9092'], // Update with your Kafka broker addresses
});

const producer = kafka.producer();

export const sendKafkaMessage = async (topic: string, message: any) => {
  try {
    await producer.connect();
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (error) {
    console.error('Error sending Kafka message:', error);
    throw error;
  } finally {
    await producer.disconnect();
  }
};