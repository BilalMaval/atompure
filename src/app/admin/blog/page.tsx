import Link from "next/link";
import { getAdminBlogPosts } from "@/lib/data/admin/blog";
import { Heading } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AdminTable } from "@/components/admin/AdminTable";

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>Blog</Heading>
        <Link href="/admin/blog/new">
          <Button>New Post</Button>
        </Link>
      </div>

      <AdminTable headers={["Title", "Status", "Created", ""]}>
        {posts.map((post) => (
          <tr key={post.id}>
            <td className="px-4 py-3">{post.title}</td>
            <td className="px-4 py-3">
              <Badge className={post.published_at ? "" : "bg-beige-200 text-charcoal-600"}>
                {post.published_at ? "Published" : "Draft"}
              </Badge>
            </td>
            <td className="px-4 py-3">{new Date(post.created_at).toLocaleDateString()}</td>
            <td className="px-4 py-3 text-right">
              <Link href={`/admin/blog/${post.id}`} className="text-sage-700 hover:underline">
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
