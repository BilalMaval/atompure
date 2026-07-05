"use client";

import { useRouter } from "next/navigation";
import { deleteBlogPost } from "@/app/actions/admin/blog";
import { Button } from "@/components/ui/Button";

export function DeleteBlogPostButton({ postId }: { postId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("Delete this blog post?")) return;
    await deleteBlogPost(postId);
    router.push("/admin/blog");
  }

  return (
    <Button variant="outline" onClick={handleDelete} className="border-red-600 text-red-600 hover:bg-red-50">
      Delete Post
    </Button>
  );
}
