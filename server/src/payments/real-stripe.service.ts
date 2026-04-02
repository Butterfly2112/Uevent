import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { PaymentProvider } from './interfaces/payment-provider.interface';

@Injectable()
export class RealStripeService implements PaymentProvider {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  async createPaymentIntent(amount: number) {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    return {
      id: intent.id,
      client_secret: intent.client_secret!,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    return await this.stripe.paymentIntents.confirm(paymentIntentId);
  }

  async refund(paymentIntentId: string) {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  }
}
