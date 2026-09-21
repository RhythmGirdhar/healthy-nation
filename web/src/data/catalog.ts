// Editable preview content, not a verified menu. Replace only with team-approved facts.
export const catalogData = {
  isPreview: true,
  meals: [
    {
      id: "harissa-chicken-bowl",
      slug: "harissa-chicken-bowl",
      name: "Harissa chicken bowl",
      description:
        "A sample bowl concept with harissa-style chicken, grains and colourful vegetables. Recipe and availability need confirmation with the team.",
      category: "Bowls",
      diet: "Non-vegetarian",
      ingredients: [
        "Illustrative chicken, grains, vegetables and harissa-style dressing; confirm actual ingredients with the team.",
      ],
      allergens: [
        "Illustrative recipe only: dressing and grains may contain allergens. Confirm the full allergen list and cross-contact with the team.",
      ],
      tags: ["Sample recipe", "Illustrative ingredients"],
      options: ["Standard", "Dressing on the side"],
      featured: true,
      available: true,
      price: null,
      currency: "INR",
      portion: "Illustrative single bowl; confirm portion size with the team.",
      accent: "peach",
      art: "bowl",
      isSample: true,
    },
    {
      id: "paneer-garden-bowl",
      slug: "paneer-garden-bowl",
      name: "Paneer garden bowl",
      description:
        "A sample paneer bowl concept with garden vegetables and grains. Recipe and availability need confirmation with the team.",
      category: "Bowls",
      diet: "Vegetarian",
      ingredients: [
        "Illustrative paneer, grains, vegetables and herb dressing; confirm actual ingredients with the team.",
      ],
      allergens: [
        "Illustrative allergens include milk from paneer; this is not a complete list. Confirm all allergens and cross-contact with the team.",
      ],
      tags: ["Sample recipe", "Illustrative ingredients"],
      options: ["Standard", "Dressing on the side"],
      featured: true,
      available: true,
      price: null,
      currency: "INR",
      portion: "Illustrative single bowl; confirm portion size with the team.",
      accent: "sage",
      art: "bowl",
      isSample: true,
    },
    {
      id: "lemon-herb-chickpea-bowl",
      slug: "lemon-herb-chickpea-bowl",
      name: "Lemon herb chickpea bowl",
      description:
        "A sample chickpea bowl concept with lemon, herbs and vegetables. Recipe and availability need confirmation with the team.",
      category: "Bowls",
      diet: "Plant-based",
      ingredients: [
        "Illustrative chickpeas, grains, vegetables, lemon and herbs; confirm actual ingredients with the team.",
      ],
      allergens: [
        "Illustrative recipe only: grains and dressing may contain allergens. Confirm the full allergen list and cross-contact with the team.",
      ],
      tags: ["Sample recipe", "Illustrative ingredients"],
      options: ["Standard", "Dressing on the side"],
      featured: true,
      available: true,
      price: null,
      currency: "INR",
      portion: "Illustrative single bowl; confirm portion size with the team.",
      accent: "gold",
      art: "bowl",
      isSample: true,
    },
    {
      id: "oats-berry-pot",
      slug: "oats-berry-pot",
      name: "Oats & berry pot",
      description:
        "A sample breakfast pot concept with oats and berries. Recipe and availability need confirmation with the team.",
      category: "Breakfast",
      diet: "Vegetarian",
      ingredients: [
        "Illustrative oats, yoghurt, berries and toppings; confirm actual ingredients with the team.",
      ],
      allergens: [
        "Illustrative allergens include milk and potentially gluten or nuts in toppings; this is not a complete list. Confirm all allergens and cross-contact with the team.",
      ],
      tags: ["Sample recipe", "Illustrative ingredients"],
      options: ["Standard", "Toppings on the side"],
      featured: false,
      available: true,
      price: null,
      currency: "INR",
      portion: "Illustrative single pot; confirm portion size with the team.",
      accent: "lilac",
      art: "oats",
      isSample: true,
    },
    {
      id: "sesame-tofu-crunch-bowl",
      slug: "sesame-tofu-crunch-bowl",
      name: "Sesame tofu crunch bowl",
      description:
        "A sample tofu bowl concept with sesame and crunchy vegetables. Recipe and availability need confirmation with the team.",
      category: "Bowls",
      diet: "Plant-based",
      ingredients: [
        "Illustrative tofu, sesame, grains, vegetables and dressing; confirm actual ingredients with the team.",
      ],
      allergens: [
        "Illustrative allergens include soy and sesame; this is not a complete list. Confirm all allergens and cross-contact with the team.",
      ],
      tags: ["Sample recipe", "Illustrative ingredients"],
      options: ["Standard", "Dressing on the side"],
      featured: false,
      available: true,
      price: null,
      currency: "INR",
      portion: "Illustrative single bowl; confirm portion size with the team.",
      accent: "peach",
      art: "bowl",
      isSample: true,
    },
    {
      id: "green-goddess-wrap",
      slug: "green-goddess-wrap",
      name: "Green goddess wrap",
      description:
        "A sample wrap concept with vegetables and herb dressing. Recipe and availability need confirmation with the team.",
      category: "Wraps",
      diet: "Vegetarian",
      ingredients: [
        "Illustrative flatbread, vegetables and herb dressing; confirm actual ingredients with the team.",
      ],
      allergens: [
        "Illustrative allergens include wheat and potentially milk in dressing; this is not a complete list. Confirm all allergens and cross-contact with the team.",
      ],
      tags: ["Sample recipe", "Illustrative ingredients"],
      options: ["Standard", "Dressing on the side"],
      featured: false,
      available: true,
      price: null,
      currency: "INR",
      portion: "Illustrative single wrap; confirm portion size with the team.",
      accent: "sage",
      art: "wrap",
      isSample: true,
    },
  ],
  plans: [
    {
      id: "sample-starter",
      name: "Sample starter",
      eyebrow: "An illustrative first step",
      description:
        "A sample three-meal, three-day idea, not a live offer. Confirm the menu, schedule and availability with the team.",
      meals: 3,
      days: 3,
      price: null,
      inclusions: [
        "Illustrative selection of three meals",
        "Sample three-day schedule; confirm dates with the team",
        "Menu, portions and pricing to be confirmed",
      ],
      featured: false,
      isSample: true,
    },
    {
      id: "sample-weekday",
      name: "Sample weekday",
      eyebrow: "An illustrative weekday rhythm",
      description:
        "A sample five-meal, five-day idea, not a live offer. Confirm the menu, schedule and availability with the team.",
      meals: 5,
      days: 5,
      price: null,
      inclusions: [
        "Illustrative selection of five meals",
        "Sample five-day schedule; confirm dates with the team",
        "Menu, portions and pricing to be confirmed",
      ],
      featured: true,
      isSample: true,
    },
    {
      id: "sample-two-week",
      name: "Sample two-week",
      eyebrow: "An illustrative longer routine",
      description:
        "A sample ten-meal, ten-day idea, not a live offer. Confirm the menu, schedule and availability with the team.",
      meals: 10,
      days: 10,
      price: null,
      inclusions: [
        "Illustrative selection of ten meals",
        "Sample ten-day schedule; confirm dates with the team",
        "Menu, portions and pricing to be confirmed",
      ],
      featured: false,
      isSample: true,
    },
  ],
  weeklyMenu: {
    label: "Sample five-day menu",
    isSample: true,
    days: [
      { day: "Monday", mealId: "harissa-chicken-bowl" },
      { day: "Tuesday", mealId: "paneer-garden-bowl" },
      { day: "Wednesday", mealId: "lemon-herb-chickpea-bowl" },
      { day: "Thursday", mealId: "sesame-tofu-crunch-bowl" },
      { day: "Friday", mealId: "green-goddess-wrap" },
    ],
  },
  faqs: [
    {
      id: "sample-menu",
      question: "Is this the confirmed menu?",
      answer:
        "No. This is a sample preview for Healthy Nation. Meal concepts, plans, dietary labels and the weekly menu are illustrative, not confirmed offers. Ask the team about actual availability.",
    },
    {
      id: "prices",
      question: "Where are the prices?",
      answer:
        "Prices have not been supplied. Ask the team to confirm meal or plan pricing, delivery charges and the final total before proceeding.",
    },
    {
      id: "ingredients-allergens",
      question: "Can I rely on the ingredient or allergen information?",
      answer:
        "No. Ingredients, allergens and portions are illustrative and incomplete. Confirm actual recipes, all allergens and cross-contact with the team. No allergen safety, nutrition or medical claims have been verified.",
    },
    {
      id: "delivery",
      question: "Where and when is delivery available?",
      answer:
        "Delivery areas, timing, charges and policies have not been supplied. Ask the team to confirm whether your requested date and delivery location can be supported.",
    },
    {
      id: "inquiries",
      question: "Does sending an inquiry place an order?",
      answer:
        "No. A WhatsApp inquiry, when contact is configured, starts a conversation only. It does not place, pay for or confirm an order. The team must confirm availability, details and how to complete your request.",
    },
  ],
};
