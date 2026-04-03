export interface PaymentProvider {
  createPaymentIntent(amount: number): Promise<{
    id: string;
    client_secret: string;
  }>;

  confirmPayment(paymentIntentId: string): Promise<any>;

  refund(paymentIntentId: string): Promise<any>;
}