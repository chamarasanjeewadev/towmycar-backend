import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Updated to the latest API version
});

router.post('/save-card', async (req, res) => {
  try {
    // Create a SetupIntent for saving the card
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ['card'],
      customer: req.body.customerId, // Attach to the driver's Stripe customer ID
    });

    res.status(200).json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
