"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "@/lib/cart/cart-context";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { createOrder, validateCoupon } from "@/app/actions/checkout";
import { Container } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";
import { formatPrice } from "@/lib/format";
import type { Address } from "@/lib/data/addresses";

interface CheckoutFormProps {
  isLoggedIn: boolean;
  userEmail?: string;
  addresses: Address[];
}

export function CheckoutForm({ isLoggedIn, userEmail, addresses }: CheckoutFormProps) {
  const {
    items,
    subtotal,
    clear,
    hasFreeDelivery,
    freeDeliveryThreshold,
    shippingCost,
    originalShippingCost,
    isShippingDiscounted,
  } = useCart();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: "percent" | "fixed";
    value: number;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: "PK", paymentMethod: "cod", email: userEmail ?? "" },
  });

  function applyAddress(address: Address) {
    setValue("fullName", address.full_name);
    setValue("phone", address.phone);
    setValue("line1", address.line1);
    setValue("line2", address.line2 ?? "");
    setValue("city", address.city);
    setValue("province", address.province ?? "");
    setValue("postalCode", address.postal_code ?? "");
    setValue("country", address.country);
  }

  function handleSelectAddress(id: string) {
    setSelectedAddressId(id);
    if (!id) return;
    const address = addresses.find((a) => a.id === id);
    if (address) applyAddress(address);
  }

  async function handleApplyCoupon() {
    setCouponError(null);
    setIsApplyingCoupon(true);
    const result = await validateCoupon(couponInput);
    setIsApplyingCoupon(false);

    if (!result.success || !result.discountType || result.value === undefined) {
      setCouponError(result.error ?? "Invalid coupon code.");
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon({ code: couponInput.toUpperCase(), discountType: result.discountType, value: result.value });
  }

  const discountTotal = useMemo(() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discountType === "percent"
      ? subtotal * (appliedCoupon.value / 100)
      : Math.min(appliedCoupon.value, subtotal);
  }, [appliedCoupon, subtotal]);

  const estimatedTotal = Math.max(0, subtotal - discountTotal) + shippingCost;

  async function onSubmit(values: CheckoutInput) {
    setSubmitError(null);
    setIsSubmitting(true);
    const result = await createOrder({
      checkout: { ...values, couponCode: appliedCoupon?.code },
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    });
    setIsSubmitting(false);

    if (!result.success || !result.orderNumber) {
      setSubmitError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    clear();
    router.push(`/order-confirmation/${result.orderNumber}`);
  }

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <Heading level={1} className="mb-4">
          Checkout
        </Heading>
        <Text className="mb-6">Your cart is empty.</Text>
        <Link href="/shop">
          <Button>Continue Shopping</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />
      <Heading level={1} className="mb-8">
        Checkout
      </Heading>

      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          <section>
            <Heading level={3} className="mb-4">
              Contact
            </Heading>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Input placeholder="Full name" {...register("fullName")} />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
                )}
              </div>
              <div>
                <Input placeholder="Phone" {...register("phone")} />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Input placeholder="Email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
          </section>

          <section>
            <Heading level={3} className="mb-4">
              Shipping Address
            </Heading>

            {isLoggedIn && addresses.length > 0 && (
              <div className="mb-4">
                <select
                  value={selectedAddressId}
                  onChange={(e) => handleSelectAddress(e.target.value)}
                  className="h-11 w-full rounded-lg border border-beige-300 bg-cream-50 px-4 text-sm"
                >
                  <option value="">Use a new address</option>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.full_name} — {address.line1}, {address.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input placeholder="Address line 1" {...register("line1")} />
                {errors.line1 && (
                  <p className="mt-1 text-xs text-red-600">{errors.line1.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Input placeholder="Address line 2 (optional)" {...register("line2")} />
              </div>
              <div>
                <Input placeholder="City" {...register("city")} />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>
                )}
              </div>
              <Input placeholder="Province (optional)" {...register("province")} />
              <Input placeholder="Postal code (optional)" {...register("postalCode")} />
            </div>

            {isLoggedIn && (
              <label className="mt-3 flex items-center gap-2 text-sm text-charcoal-600">
                <input type="checkbox" {...register("saveAddress")} />
                Save this address to my account
              </label>
            )}
          </section>

          <section>
            <Heading level={3} className="mb-4">
              Payment Method
            </Heading>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 rounded-lg border border-sage-600 bg-sage-50 p-4">
                <input
                  type="radio"
                  value="cod"
                  defaultChecked
                  {...register("paymentMethod")}
                />
                <span className="font-medium">Cash on Delivery</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-beige-200 p-4 opacity-60">
                <input type="radio" disabled />
                <span>JazzCash</span>
                <Badge className="ml-auto">Coming soon</Badge>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-beige-200 p-4 opacity-60">
                <input type="radio" disabled />
                <span>Easypaisa</span>
                <Badge className="ml-auto">Coming soon</Badge>
              </label>
            </div>
          </section>

          {submitError && (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>
        </form>

        <div className="rounded-2xl border border-beige-200 p-6">
          <Heading level={3} className="mb-4">
            Order Summary
          </Heading>
          <ul className="mb-4 flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.variantId} className="flex justify-between text-sm">
                <span>
                  {item.productName} ({item.variantName}) &times; {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
              Apply
            </Button>
          </div>
          {couponError && <p className="mb-3 text-xs text-red-600">{couponError}</p>}
          {appliedCoupon && (
            <p className="mb-3 text-xs text-sage-700">
              Coupon {appliedCoupon.code} applied.
            </p>
          )}

          <div className="flex flex-col gap-2 border-t border-beige-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-sage-700">
                <span>Discount</span>
                <span>-{formatPrice(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery</span>
              {isShippingDiscounted ? (
                <span className="flex items-center gap-2">
                  <span className="text-charcoal-400 line-through">{formatPrice(originalShippingCost)}</span>
                  <span className={shippingCost === 0 ? "text-sage-700" : undefined}>
                    {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                  </span>
                </span>
              ) : (
                <span className={shippingCost === 0 ? "text-sage-700" : undefined}>
                  {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                </span>
              )}
            </div>
            <div className="flex justify-between text-charcoal-500">
              <span>Tax</span>
              <span>Calculated at order placement</span>
            </div>
            {!hasFreeDelivery && subtotal < freeDeliveryThreshold && (
              <Text className="text-xs">
                Add {formatPrice(freeDeliveryThreshold - subtotal)} more for free shipping.
              </Text>
            )}
          </div>

          <div className="mt-4 flex justify-between border-t border-beige-200 pt-4 font-medium text-charcoal-800">
            <span>Estimated Total</span>
            <span>{formatPrice(estimatedTotal)}</span>
          </div>
        </div>
      </div>
    </Container>
  );
}
