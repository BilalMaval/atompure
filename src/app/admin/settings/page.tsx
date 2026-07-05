import { getStoreSettings } from "@/lib/data/admin/settings";
import { Heading, Text } from "@/components/ui/Typography";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="flex flex-col gap-6">
      <Heading level={1}>Settings</Heading>
      <Text className="max-w-lg text-sm text-charcoal-500">
        Multi-zone shipping rates and payment gateway keys aren&apos;t configured here —
        payment keys stay in environment variables for security. The flat rate and tax
        percentage below apply storewide.
      </Text>

      <SettingsForm
        initialValues={{
          storeName: settings?.store_name ?? "",
          supportEmail: settings?.support_email ?? "",
          supportPhone: settings?.support_phone ?? "",
          gaMeasurementId: settings?.ga_measurement_id ?? "",
          flatShippingRate: settings?.flat_shipping_rate ?? 0,
          freeShippingThreshold: settings?.free_shipping_threshold ?? 2500,
          taxRatePercent: settings?.tax_rate_percent ?? 0,
        }}
      />
    </div>
  );
}
