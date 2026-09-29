const WEIGHTS = { budget: 40, purpose: 25, preferences: 25, rating: 10 };

const scoreHotel = (hotel, { budget, purpose, preferences = [] }) => {
  let score = 0;
  const reasons = [];

  // 1. Budget
  if (hotel.priceRange <= budget) {
    score += WEIGHTS.budget;
    reasons.push("✓ Within budget");
  } else if (hotel.priceRange <= budget * 1.2) {
    score += WEIGHTS.budget / 2;
    reasons.push("~ Slightly over budget");
  } else {
    reasons.push("✗ Over budget");
  }

  // 2. Travel purpose
  const suitableFor = (hotel.suitableFor || []).map((s) => s.toLowerCase());
  if (suitableFor.includes(purpose.toLowerCase())) {
    score += WEIGHTS.purpose;
    reasons.push(`✓ Suitable for ${purpose}`);
  } else {
    reasons.push(`✗ Not listed for ${purpose}`);
  }

  // 3. Preferences (amenities)
  const amenities = (hotel.amenities || []).map((a) => a.toLowerCase());
  if (preferences.length === 0) {
    score += WEIGHTS.preferences;
  } else {
    let matched = 0;
    preferences.forEach((pref) => {
      if (amenities.includes(pref.toLowerCase())) {
        matched++;
        reasons.push(`✓ ${pref} available`);
      } else {
        reasons.push(`✗ No ${pref}`);
      }
    });
    score += (matched / preferences.length) * WEIGHTS.preferences;
  }

  // 4. Rating
  score += ((hotel.rating || 0) / 5) * WEIGHTS.rating;

  return { score: Math.round(score), reasons };
};

module.exports = scoreHotel;
