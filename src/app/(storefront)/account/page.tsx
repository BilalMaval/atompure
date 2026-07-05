import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyOrders } from "@/lib/data/account";
import { Heading, Text } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orders = await getMyOrders();

  return (
    <div>
      <Heading level={1} className="mb-2">
        My Account
      </Heading>
      <Text className="mb-8">Signed in as {user?.email}.</Text>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/account/orders">
          <Card>
            <Text className="text-xs uppercase tracking-wide text-sage-600">Orders</Text>
            <Heading level={3}>{orders.length}</Heading>
          </Card>
        </Link>
        <Link href="/account/wishlist">
          <Card>
            <Text className="text-xs uppercase tracking-wide text-sage-600">Wishlist</Text>
            <Heading level={3}>View saved items</Heading>
          </Card>
        </Link>
        <Link href="/account/addresses">
          <Card>
            <Text className="text-xs uppercase tracking-wide text-sage-600">Addresses</Text>
            <Heading level={3}>Manage addresses</Heading>
          </Card>
        </Link>
        <Link href="/account/profile">
          <Card>
            <Text className="text-xs uppercase tracking-wide text-sage-600">Profile</Text>
            <Heading level={3}>Update details</Heading>
          </Card>
        </Link>
      </div>
    </div>
  );
}
