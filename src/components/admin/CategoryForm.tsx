"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "@/lib/validations/admin/category";
import { createCategory, updateCategory } from "@/app/actions/admin/categories";
import { slugify } from "@/lib/slugify";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CategoryFormProps {
  categories: { id: string; name: string }[];
  initialValues?: Partial<CategoryInput>;
  categoryId?: string;
}

export function CategoryForm({ categories, initialValues, categoryId }: CategoryFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When editing an existing category, its slug already has real content —
  // don't auto-overwrite it as the admin edits the name.
  const slugTouched = useRef(Boolean(categoryId));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { sortOrder: 0, ...initialValues },
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (!slugTouched.current) {
      setValue("slug", slugify(nameValue || ""));
    }
  }, [nameValue, setValue]);

  async function onSubmit(values: CategoryInput) {
    setError(null);
    setIsSubmitting(true);
    const result = categoryId
      ? await updateCategory(categoryId, values)
      : await createCategory(values);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    router.push("/admin/categories");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Input placeholder="Name" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <Input
            placeholder="Slug"
            {...register("slug", { onChange: () => (slugTouched.current = true) })}
          />
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
        </div>
        <select
          {...register("parentId")}
          className="h-11 w-full rounded-lg border border-beige-300 bg-cream-50 px-4 text-sm"
          defaultValue=""
        >
          <option value="">No parent</option>
          {categories
            .filter((c) => c.id !== categoryId)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        <Input placeholder="Sort order" type="number" {...register("sortOrder", { valueAsNumber: true })} />
      </div>

      <Input placeholder="SEO title" {...register("seoTitle")} />
      <Input placeholder="SEO description" {...register("seoDescription")} />

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Saving..." : categoryId ? "Save Changes" : "Create Category"}
      </Button>
    </form>
  );
}
