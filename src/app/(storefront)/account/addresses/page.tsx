import { getMyAddresses } from "@/lib/data/addresses";
import { Heading } from "@/components/ui/Typography";
import { AddressManager } from "@/components/storefront/AddressManager";

export default async function AccountAddressesPage() {
  const addresses = await getMyAddresses();

  return (
    <div>
      <Heading level={1} className="mb-6">
        My Addresses
      </Heading>
      <AddressManager addresses={addresses} />
    </div>
  );
}
