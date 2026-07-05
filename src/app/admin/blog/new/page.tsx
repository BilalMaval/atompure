import { Heading } from "@/components/ui/Typography";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <Heading level={1}>New Blog Post</Heading>
      <BlogPostForm />
    </div>
  );
}
