export const PURPOSES = [
  { value: "business", label: "Business" },
  { value: "family", label: "Family" },
  { value: "leisure", label: "Leisure" },
  { value: "solo", label: "Solo" },
];

export const AMENITIES = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "workspace", label: "Workspace" },
  { value: "breakfast", label: "Breakfast" },
  { value: "pool", label: "Pool" },
  { value: "gym", label: "Gym" },
  { value: "parking", label: "Parking" },
];

export const amenityLabel = (value) =>
  AMENITIES.find((a) => a.value === value)?.label || value;

export const formatINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export const nightsBetween = (checkIn, checkOut) =>
  Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Real photo if the hotel has one; otherwise a stable placeholder per hotel
export const hotelImage = (imageUrl, name) =>
  imageUrl ||
  `https://picsum.photos/seed/smartstay-${encodeURIComponent(name)}/800/600`;
