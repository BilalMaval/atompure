export const FREE_SHIPPING_THRESHOLD = 2500;
// Bumped to v2: older stored carts predate the `deliveryCharge` field on
// CartItem and would silently show free shipping for items added before
// that field existed. Changing the key makes every browser start with a
// clean cart instead of replaying incompatible old data.
export const CART_STORAGE_KEY = "atompure_cart_v2";
