import "server-only";
import type { Course } from "@prisma/client";

// ---------------------------------------------------------------------------
//  Payments abstraction (design-ready stub, Stripe-compatible)
//  The "stub" driver creates a PAID order immediately so paid-course flows are
//  fully exercisable without keys. Swapping to Stripe means implementing
//  createCheckout/handleWebhook to return a hosted checkout URL and confirm via
//  webhook — the order/access-control model already supports it.
// ---------------------------------------------------------------------------

export interface CheckoutResult {
  /** Where to redirect the buyer. For the stub this is the course itself. */
  redirectUrl: string;
  /** Whether access should be granted right now (true for the stub). */
  grantImmediately: boolean;
  provider: string;
  providerRef?: string;
}

export interface PaymentProvider {
  driver: string;
  createCheckout(args: {
    course: Pick<Course, "id" | "slug" | "price" | "currency">;
    userId: string;
    locale: string;
  }): Promise<CheckoutResult>;
}

class StubPayments implements PaymentProvider {
  driver = "stub";
  async createCheckout({
    course,
    locale,
  }: {
    course: Pick<Course, "id" | "slug" | "price" | "currency">;
    userId: string;
    locale: string;
  }): Promise<CheckoutResult> {
    return {
      redirectUrl: `/${locale}/learn/${course.slug}`,
      grantImmediately: true,
      provider: "stub",
      providerRef: `stub_${Date.now()}`,
    };
  }
}

class StripePayments implements PaymentProvider {
  driver = "stripe";
  async createCheckout(): Promise<CheckoutResult> {
    throw new Error(
      "Stripe is not wired yet. Add the stripe SDK, implement checkout + webhook, then set PAYMENTS_DRIVER=stripe."
    );
  }
}

export function getPaymentProvider(): PaymentProvider {
  return process.env.PAYMENTS_DRIVER === "stripe" ? new StripePayments() : new StubPayments();
}
