import express from "express";
import Stripe from "stripe";
import { DriverRepository } from "../repository/driver.repository";
import { clerkAuthMiddleware } from "../middleware/clerkAuth";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20", // Updated to the latest API version
});

router.post("/save-card", async (req, res) => {
  try {
    // Create a SetupIntent for saving the card
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
      customer: req.body.customerId, // Attach to the driver's Stripe customer ID
    });

    res.status(200).json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
});

router.post("/confirm-setup-intent",clerkAuthMiddleware("driver"), async (req, res) => {
  try {
    const driverId = req.userInfo.driverId;
    const { id, payment_method } = req.body;
    console.log("req.body", req.body);

    // let setupIntent;
    // try {
    //   // Attempt to confirm the SetupIntent
    //   setupIntent = await stripe.setupIntents.confirm(id, {
    //     payment_method: payment_method,
    //   });
    // } catch (stripeError: any) {
    //   if (stripeError.code === "setup_intent_unexpected_state") {
    //     console.error("The SetupIntent is in an unexpected state.");
    //     // Handle the error accordingly, like retrying the process or creating a new SetupIntent
    //   }
    //   // Check if the error is due to the SetupIntent already being confirmed
    //   if (stripeError.code === "setup_intent_already_succeeded") {
    //     // If already confirmed, retrieve the SetupIntent
    //     setupIntent = await stripe.setupIntents.retrieve(id);
    //   } else {
    //     // If it's a different error, throw it to be caught by the outer catch block
    //     throw stripeError;
    //   }
    // }

    // if (setupIntent.status === "succeeded") {
    // Update the driver's record with the payment method ID
    const updatedDriver = await DriverRepository.updateDriverPaymentMethod(
      driverId,
      payment_method
    );

    if (updatedDriver) {
      res.status(200).json({
        message: "Setup intent confirmed and driver updated successfully",
      });
    } else {
      res.status(404).json({ error: "Driver not found" });
    }
    // } else {
    //   res
    //     .status(400)
    //     .json({ error: "Setup intent confirmation failed", setupIntent });
    // }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
