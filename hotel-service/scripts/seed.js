require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");

// Free-to-use photos from Unsplash (unsplash.com/license)
const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

// priceRange is calculated from the cheapest room, so the "From ₹X" in the UI always matches
const hotels = [
  // ---------- Bangalore ----------
  {
    name: "Halcyon Business Hotel",
    location: "Whitefield, Bangalore",
    description:
      "Ten minutes from ITPL, with quiet work desks in every room and an early breakfast from 6:30.",
    rating: 4.3,
    amenities: ["wifi", "workspace", "breakfast", "gym"],
    suitableFor: ["business", "solo"],
    imageUrl: unsplash("1788436186647-2f1591706b15"),
    rooms: [
      { roomType: "Standard Twin", pricePerNight: 3900, capacity: 2 },
      { roomType: "Business King", pricePerNight: 4600, capacity: 2 },
    ],
  },
  {
    name: "The Cubbon Residency",
    location: "MG Road, Bangalore",
    description:
      "Upper-floor rooms facing Cubbon Park, a short walk from the MG Road metro station.",
    rating: 4.6,
    amenities: ["wifi", "workspace", "breakfast", "gym", "parking"],
    suitableFor: ["business", "solo"],
    imageUrl: unsplash("1776500587875-8a0653e9c10e"),
    rooms: [
      { roomType: "Deluxe King", pricePerNight: 5200, capacity: 2 },
      { roomType: "Executive Suite", pricePerNight: 8400, capacity: 3 },
    ],
  },
  {
    name: "Indiranagar House",
    location: "Indiranagar, Bangalore",
    description:
      "A twelve-room boutique stay off 100 Feet Road, close to cafes and live music venues.",
    rating: 4.5,
    amenities: ["wifi", "workspace", "breakfast"],
    suitableFor: ["solo", "leisure"],
    imageUrl: unsplash("1685592437742-3b56edb46b15"),
    rooms: [
      { roomType: "Studio Queen", pricePerNight: 4400, capacity: 2 },
      { roomType: "Loft Room", pricePerNight: 5600, capacity: 2 },
    ],
  },
  {
    name: "Lalbagh Garden Retreat",
    location: "Basavanagudi, Bangalore",
    description:
      "Low-rise rooms set around a garden courtyard, with a shaded pool and space for families.",
    rating: 4.4,
    amenities: ["wifi", "pool", "breakfast", "parking"],
    suitableFor: ["family", "leisure"],
    imageUrl: unsplash("1769913764783-3c97089e2eab"),
    rooms: [
      { roomType: "Garden Room", pricePerNight: 6200, capacity: 3 },
      { roomType: "Family Suite", pricePerNight: 9800, capacity: 5 },
    ],
  },
  {
    name: "Koramangala Stay Inn",
    location: "Koramangala, Bangalore",
    description:
      "Simple, clean rooms for short stays. Self check-in after 10 pm.",
    rating: 3.7,
    amenities: ["wifi", "parking"],
    suitableFor: ["solo", "business"],
    imageUrl: unsplash("1759264244764-2cb80f1a67bd"),
    rooms: [
      { roomType: "Single Room", pricePerNight: 1900, capacity: 1 },
      { roomType: "Double Room", pricePerNight: 2400, capacity: 2 },
    ],
  },
  {
    name: "Devanahalli Pool Resort",
    location: "Devanahalli, Bangalore",
    description:
      "Twenty minutes from the airport, with a large pool, lawns, and villas for bigger groups.",
    rating: 4.2,
    amenities: ["wifi", "pool", "gym", "breakfast", "parking"],
    suitableFor: ["family", "leisure"],
    imageUrl: unsplash("1695124566076-9e510f268acf"),
    rooms: [
      { roomType: "Pool View Room", pricePerNight: 7500, capacity: 3 },
      { roomType: "Private Villa", pricePerNight: 12500, capacity: 6 },
    ],
  },

  // ---------- Mumbai ----------
  {
    name: "Bandra Bay Hotel",
    location: "Bandra West, Mumbai",
    description:
      "Close to the Bandra-Kurla Complex, with sea-facing suites and a 24-hour business lounge.",
    rating: 4.4,
    amenities: ["wifi", "workspace", "breakfast", "gym"],
    suitableFor: ["business", "solo"],
    imageUrl: unsplash("1748614611896-7a12a0b00b9a"),
    rooms: [
      { roomType: "Deluxe Room", pricePerNight: 6800, capacity: 2 },
      { roomType: "Sea View Suite", pricePerNight: 11200, capacity: 3 },
    ],
  },
  {
    name: "Powai Lakeside Residency",
    location: "Powai, Mumbai",
    description:
      "Next to Hiranandani Gardens, with a rooftop pool and larger rooms for families.",
    rating: 4.1,
    amenities: ["wifi", "pool", "workspace", "parking"],
    suitableFor: ["business", "family"],
    imageUrl: unsplash("1724947052687-e580b3010aad"),
    rooms: [
      { roomType: "Superior Room", pricePerNight: 5400, capacity: 2 },
      { roomType: "Family Room", pricePerNight: 7600, capacity: 4 },
    ],
  },

  // ---------- Goa ----------
  {
    name: "Candolim Palms Beach Resort",
    location: "Candolim, Goa",
    description:
      "Cottages under palm trees, two minutes' walk from Candolim beach.",
    rating: 4.5,
    amenities: ["wifi", "pool", "breakfast", "parking"],
    suitableFor: ["leisure", "family"],
    imageUrl: unsplash("1757025662913-f5241f0754c6"),
    rooms: [
      { roomType: "Garden Cottage", pricePerNight: 8200, capacity: 2 },
      { roomType: "Beach Villa", pricePerNight: 13500, capacity: 4 },
    ],
  },
  {
    name: "Anjuna Shore House",
    location: "Anjuna, Goa",
    description:
      "A relaxed guesthouse near the Wednesday flea market, with breakfast served on the terrace.",
    rating: 4.0,
    amenities: ["wifi", "breakfast"],
    suitableFor: ["leisure", "solo"],
    imageUrl: unsplash("1768047846080-d477e260ff00"),
    rooms: [
      { roomType: "Sea Breeze Room", pricePerNight: 3600, capacity: 2 },
      { roomType: "Twin Room", pricePerNight: 4200, capacity: 2 },
    ],
  },

  // ---------- Jaipur ----------
  {
    name: "Amer Heritage Haveli",
    location: "Amer Road, Jaipur",
    description:
      "A restored haveli with a courtyard pool, close to Amer Fort and Jal Mahal.",
    rating: 4.6,
    amenities: ["wifi", "breakfast", "pool", "parking"],
    suitableFor: ["leisure", "family"],
    imageUrl: unsplash("1782758895746-f1fa6916acab"),
    rooms: [
      { roomType: "Heritage Room", pricePerNight: 5800, capacity: 2 },
      { roomType: "Haveli Suite", pricePerNight: 10500, capacity: 4 },
    ],
  },
  {
    name: "Pink City Boutique Rooms",
    location: "C-Scheme, Jaipur",
    description:
      "Small, colourful rooms within walking distance of the old city bazaars.",
    rating: 4.2,
    amenities: ["wifi", "breakfast", "workspace"],
    suitableFor: ["solo", "leisure"],
    imageUrl: unsplash("1729194160985-dffbb52e37ac"),
    rooms: [
      { roomType: "Classic Queen", pricePerNight: 3200, capacity: 2 },
      { roomType: "Corner Room", pricePerNight: 3900, capacity: 2 },
    ],
  },

  // ---------- Mysuru ----------
  {
    name: "Chamundi Hills Retreat",
    location: "Chamundi Hills, Mysuru",
    description:
      "Hillside rooms with a pool overlooking the city, 15 minutes from Mysore Palace.",
    rating: 4.3,
    amenities: ["wifi", "pool", "breakfast", "parking"],
    suitableFor: ["family", "leisure"],
    imageUrl: unsplash("1648995505975-8fe3ebc7b253"),
    rooms: [
      { roomType: "Hill View Room", pricePerNight: 4800, capacity: 3 },
      { roomType: "Family Cottage", pricePerNight: 7200, capacity: 5 },
    ],
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Safety check: this script wipes data, so only run it against the Hotel Service database
  if (mongoose.connection.name !== "smartstay_hotels") {
    throw new Error(
      `Refusing to seed "${mongoose.connection.name}". Expected smartstay_hotels.`,
    );
  }

  await Room.deleteMany({});
  await Hotel.deleteMany({});
  console.log("Cleared existing hotels and rooms");

  let roomCount = 0;

  for (const { rooms, ...hotelData } of hotels) {
    const hotel = await Hotel.create({
      ...hotelData,
      priceRange: Math.min(...rooms.map((r) => r.pricePerNight)),
    });

    await Room.insertMany(
      rooms.map((room) => ({ ...room, hotelId: hotel._id })),
    );
    roomCount += rooms.length;

    console.log(
      `  Added ${hotel.name} (${hotel.location}), ${rooms.length} rooms`,
    );
  }

  console.log(`Done: ${hotels.length} hotels, ${roomCount} rooms`);
};

seed()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
