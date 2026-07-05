import Link from "next/link";
import { getMyWishlist } from "@/lib/data/account";
import { Heading, Text } from "@/components/ui/Typography";
import { ProductCard } from "@/components/storefront/ProductCard";

export default async function AccountWishlistPage() {
  const wishlist = await getMyWishlist();
  const products = wishlist.map((w) => w.product).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div>
      <Heading level={1} className="mb-6">
        My Wishlist
      </Heading>

      {products.length === 0 ? (
        <Text>
          Your wishlist is empty.{" "}
          <Link href="/shop" className="text-sage-700 underline">
            Browse products
          </Link>
          .
        </Text>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
