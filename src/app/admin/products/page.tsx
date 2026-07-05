import Link from "next/link";
import { getAdminProducts } from "@/lib/data/admin/products";
import { Heading, Text } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading level={1}>Products</Heading>
        <Link href="/admin/products/new">
          <Button>New Product</Button>
        </Link>
      </div>

      <Text className="text-sm text-charcoal-500">
        Drag rows to set the order products appear in on the shop and category pages.
      </Text>

      <AdminProductsTable products={products} />
    </div>
  );
}
