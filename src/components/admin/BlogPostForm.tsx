"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogPostSchema, type BlogPostInput } from "@/lib/validations/admin/blog";
import { createBlogPost, updateBlogPost } from "@/app/actions/admin/blog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export function BlogPostForm({
  initialValues,
  postId,
}: {
  initialValues?: Partial<BlogPostInput>;
  postId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: { isPublished: false, ...initialValues },
  });

  async function onSubmit(values: BlogPostInput) {
    setError(null);
    setIsSubmitting(true);
    const result = postId ? await updateBlogPost(postId, values) : await createBlogPost(values);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    router.push("/admin/blog");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Input placeholder="Title" {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>
        <div>
          <Input placeholder="Slug" {...register("slug")} />
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
        </div>
      </div>

      <Input placeholder="Cover image URL (optional)" {...register("coverImageUrl")} />
      <textarea
        placeholder="Excerpt"
        {...register("excerpt")}
        className="min-h-16 rounded-lg border border-beige-300 bg-cream-50 p-4 text-sm"
      />
      <div>
        <Controller
          name="body"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Write your article..."
            />
          )}
        />
        {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input placeholder="SEO title" {...register("seoTitle")} />
        <Input placeholder="SEO description" {...register("seoDescription")} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isPublished")} />
        Published
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Saving..." : postId ? "Save Changes" : "Create Post"}
      </Button>
    </form>
  );
}
