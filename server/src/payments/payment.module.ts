import { Module } from '@nestjs/common';
import { FakeStripeService } from './fake-stripe.service';
import { RealStripeService } from './real-stripe.service';

const useFake = process.env.USE_FAKE_PAYMENTS === 'true';

@Module({
  providers: [
    {
      provide: 'PAYMENT_PROVIDER',
      useClass: useFake ? FakeStripeService : RealStripeService,
    },
  ],
  exports: ['PAYMENT_PROVIDER'],
})
export class PaymentModule {}