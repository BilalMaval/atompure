"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";
import { createReview } from "@/app/actions/reviews";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Typography";

export function ReviewForm({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReviewInput>({ resolver: zodResolver(reviewSchema) });

  async function onSubmit(values: ReviewInput) {
    setError(null);
    setIsSubmitting(true);
    const result = await createReview(productId, productSlug, values);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    setSubmitted(true);
  }

  function selectRating(value: number) {
    setRating(value);
    setValue("rating", value, { shouldValidate: true });
  }

  if (submitted) {
    return (
      <Text className="text-sage-700">
        Thanks for your review! It&apos;s pending approval and will appear once approved.
      </Text>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <input type="hidden" {...register("rating", { valueAsNumber: true })} />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => selectRating(value)}
            aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
            className={`text-2xl ${value <= rating ? "text-sage-600" : "text-beige-300"}`}
          >
            ★
          </button>
        ))}
      </div>
      {errors.rating && <p className="text-xs text-red-600">{errors.rating.message}</p>}

      <textarea
        placeholder="Share your experience (optional)"
        {...register("body")}
        className="min-h-20 rounded-lg border border-beige-300 bg-cream-50 p-4 text-sm"
      />

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
