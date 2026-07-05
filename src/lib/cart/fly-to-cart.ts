// Animates a small circle flying from a source element to the cart icon.
// If an imageUrl is provided it shows the product image; otherwise a solid
// sage-green dot so the animation always fires regardless of image availability.
export function flyToCart(imageUrl: string | null, sourceEl: HTMLElement | null) {
  if (typeof document === "undefined") return;

  const cartIcon = document.getElementById("cart-icon");
  if (!cartIcon) return;

  // Fall back to the button itself if no explicit source element given.
  const anchor = sourceEl ?? cartIcon;
  const startRect = anchor.getBoundingClientRect();
  const endRect = cartIcon.getBoundingClientRect();
  const size = 44;

  let flyer: HTMLElement;

  if (imageUrl) {
    const img = document.createElement("img");
    img.src = imageUrl;
    flyer = img;
  } else {
    // No image — use a branded dot so the animation still fires.
    const dot = document.createElement("div");
    dot.style.background = "#6b7c6e"; // sage-600
    dot.style.display = "flex";
    dot.style.alignItems = "center";
    dot.style.justifyContent = "center";
    dot.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5L6 8Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`;
    flyer = dot;
  }

  flyer.style.position = "fixed";
  flyer.style.left = `${startRect.left + startRect.width / 2 - size / 2}px`;
  flyer.style.top = `${startRect.top + startRect.height / 2 - size / 2}px`;
  flyer.style.width = `${size}px`;
  flyer.style.height = `${size}px`;
  flyer.style.borderRadius = "9999px";
  flyer.style.objectFit = "cover";
  flyer.style.zIndex = "9999";
  flyer.style.pointerEvents = "none";
  flyer.style.boxShadow = "0 6px 18px rgba(0,0,0,0.28)";
  flyer.style.transition = "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease 0.25s";
  flyer.style.willChange = "transform, opacity";
  document.body.appendChild(flyer);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const dx = endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
      const dy = endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);
      flyer.style.transform = `translate(${dx}px, ${dy}px) scale(0.15)`;
      flyer.style.opacity = "0.25";
    });
  });

  setTimeout(() => flyer.remove(), 750);
}
