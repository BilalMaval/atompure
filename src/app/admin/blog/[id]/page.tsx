import { notFound } from "next/navigation";
import { getAdminBlogPostById } from "@/lib/data/admin/blog";
import { Heading } from "@/components/ui/Typography";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { DeleteBlogPostButton } from "@/components/admin/DeleteBlogPostButton";

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const post = await getAdminBlogPostById(params.id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>Edit Blog Post</Heading>
        <DeleteBlogPostButton postId={post.id} />
      </div>
      <BlogPostForm
        postId={post.id}
        initialValues={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          body: post.body,
          coverImageUrl: post.cover_image_url ?? "",
          isPublished: Boolean(post.published_at),
          seoTitle: post.seo_title ?? "",
          seoDescription: post.seo_description ?? "",
        }}
      />
    </div>
  );
}
