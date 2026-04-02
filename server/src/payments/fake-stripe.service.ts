import { Injectable } from '@nestjs/common';
import { PaymentProvider } from './interfaces/payment-provider.interface';

@Injectable()
export class FakeStripeService implements PaymentProvider {
  async createPaymentIntent(amount: number) {
    return {
      id: 'pi_fake_' + Math.random().toString(36).substring(2),
      client_secret: 'fake_secret_' + Date.now(),
    };
  }

  async confirmPayment(paymentIntentId: string) {
    return {
      id: paymentIntentId,
      status: 'succeeded',
    };
  }

  async refund(paymentIntentId: string) {
    return {
      id: 'refund_' + paymentIntentId,
      status: 'succeeded',
    };
  }
}