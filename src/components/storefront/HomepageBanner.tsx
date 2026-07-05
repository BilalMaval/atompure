import Link from "next/link";
import Image from "next/image";
import { Heading, Text } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/format";
import { clsx } from "@/lib/utils";
import { resolveBannerLink, type HomepageBanner as HomepageBannerData } from "@/lib/data/banners";

const BACKGROUND_CLASSES: Record<HomepageBannerData["background_color"], string> = {
  sage: "bg-sage-50",
  cream: "bg-cream-200",
  beige: "bg-beige-100",
};

const HEADING_SIZE_CLASSES: Record<HomepageBannerData["heading_size"], string> = {
  sm: "text-[clamp(1.5rem,4vw,40px)]",
  md: "text-[clamp(2rem,5vw,56px)]",
  lg: "text-[clamp(2.25rem,6vw,72px)]",
  xl: "text-[clamp(2.5rem,8vw,95px)]",
};

const POSITION_CLASSES: Record<HomepageBannerData["heading_position"], string> = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
};

// Mirrors <Button size="lg"> styling without rendering a real <button> —
// the whole card is already a <Link>, and a <button> nested inside an
// <a> is invalid HTML (interactive content inside interactive content).
function ButtonLookalike({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-13 items-center justify-center rounded-full bg-sage-600 px-7 text-base font-medium text-cream-50 transition-colors group-hover:bg-sage-700">
      {children}
    </span>
  );
}

export function HomepageBanner({ banner }: { banner: HomepageBannerData }) {
  const link = resolveBannerLink(banner);
  const heading = banner.heading || banner.product?.name || banner.category?.name || "";

  if (banner.mode === "image") {
    return (
      <Link
        href={link}
        className="group relative flex h-[420px] w-full items-end justify-end overflow-hidden"
      >
        {banner.background_image_url ? (
          <Image
            src={banner.background_image_url}
            alt={heading}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sage-700 via-sage-600 to-charcoal-900" />
        )}
        <div className="absolute inset-0 bg-charcoal-900/30 transition-opacity duration-500 group-hover:opacity-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col items-end gap-3 p-6 text-right sm:p-8">
          {heading && (
            <Heading
              level={3}
              className="font-display text-lg font-light leading-tight !text-cream-50 sm:text-xl"
            >
              {heading}
            </Heading>
          )}
          <ButtonLookalike>{banner.button_text}</ButtonLookalike>
        </div>
      </Link>
    );
  }

  const headingClass = clsx("font-display leading-tight", HEADING_SIZE_CLASSES[banner.heading_size]);
  const productImage = banner.image_url
    ? { url: banner.image_url }
    : [...(banner.product?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];

  const reverse = banner.image_position === "right";

  return (
    <Link
      href={link}
      className={clsx(
        "group relative grid w-full overflow-hidden md:h-[420px] md:grid-cols-2",
        BACKGROUND_CLASSES[banner.background_color]
      )}
    >
      <div
        className={clsx(
          "relative min-h-[280px] md:h-full",
          reverse ? "md:order-2" : "md:order-1"
        )}
      >
        {productImage ? (
          <>
            <Image
              src={productImage.url}
              alt={heading}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-charcoal-900/35 transition-opacity duration-500 group-hover:opacity-0" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-beige-200 to-beige-300">
            <span className="font-display text-2xl text-sage-700/60">ATOM PURE</span>
          </div>
        )}
      </div>

      <div
        className={clsx(
          "flex flex-col justify-center gap-4 px-8 py-12 sm:px-16",
          POSITION_CLASSES[banner.heading_position],
          reverse ? "md:order-1" : "md:order-2"
        )}
      >
        {banner.category && <Badge>{banner.category.name}</Badge>}
        {!banner.category && banner.product && <Badge>{banner.product.name}</Badge>}
        {heading && <Heading level={2} className={headingClass}>{heading}</Heading>}
        {banner.product && (
          <Text className="text-xl font-medium text-charcoal-800">
            {formatPrice(banner.product.base_price)}
          </Text>
        )}
        <ButtonLookalike>{banner.button_text}</ButtonLookalike>
      </div>
    </Link>
  );
}
