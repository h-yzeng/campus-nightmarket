import type { FoodItem, Transaction } from '../types';

export interface SellerData {
  name: string;
  studentId: string;
  photo: string | null;
  bio: string;
  location: string;
  transactions: Transaction[];
}

export const mockSellersData: Record<string, SellerData> = {
  "Suki Sakamoto": {
    name: "Suki Sakamoto",
    studentId: "A20234567",
    photo: null,
    bio: "Japanese cuisine enthusiast! Specializing in authentic ramen bowls with homemade broth. My grandmother's recipes passed down through generations.",
    location: "Cunningham Hall",
    transactions: [
      {
        id: 1,
        buyerName: "Marco M.",
        itemName: "Tonkotsu Ramen",
        price: 10,
        date: "Nov 15, 2025",
        rating: 5,
        review: "Best ramen I've had on campus! Rich and creamy broth."
      },
      {
        id: 2,
        buyerName: "Emma B.",
        itemName: "Spicy Miso Ramen",
        price: 9,
        date: "Nov 12, 2025",
        rating: 5,
        review: "Perfect spice level! Suki is amazing."
      },
      {
        id: 3,
        buyerName: "Lily A.",
        itemName: "Shoyu Ramen",
        price: 8,
        date: "Nov 10, 2025",
        rating: 5,
        review: "So authentic! Reminds me of Tokyo."
      }
    ]
  },
  "Marco Marino": {
    name: "Marco Marino",
    studentId: "A20198765",
    photo: null,
    bio: "Italian-American pizza maker. Family recipes from Naples! Making authentic NY-style pizza right here on campus.",
    location: "Kacek Hall",
    transactions: [
      {
        id: 4,
        buyerName: "Suki S.",
        itemName: "Margherita Pizza",
        price: 6,
        date: "Nov 14, 2025",
        rating: 5,
        review: "Simple perfection! Fresh basil and amazing crust."
      },
      {
        id: 5,
        buyerName: "May N.",
        itemName: "Pepperoni Pizza",
        price: 7,
        date: "Nov 11, 2025",
        rating: 5,
        review: "Best pizza on campus, hands down!"
      },
      {
        id: 6,
        buyerName: "Chris G.",
        itemName: "Classic Cheese Pizza",
        price: 5,
        date: "Nov 9, 2025",
        rating: 4,
        review: "Great late-night option!"
      }
    ]
  },
  "Carlos Rodriguez": {
    name: "Carlos Rodriguez",
    studentId: "A20245678",
    photo: null,
    bio: "Authentic Mexican street tacos! Recipes from my abuela in Guadalajara. Fresh ingredients and homemade salsa daily.",
    location: "Carmen Hall",
    transactions: [
      {
        id: 7,
        buyerName: "Chris G.",
        itemName: "Carne Asada Tacos",
        price: 7,
        date: "Nov 13, 2025",
        rating: 5,
        review: "Incredible! Just like the tacos in Mexico City."
      },
      {
        id: 8,
        buyerName: "Emma B.",
        itemName: "Chicken Tacos",
        price: 6,
        date: "Nov 9, 2025",
        rating: 5,
        review: "So fresh and flavorful! Carlos is the best."
      }
    ]
  },
  "Lily Aspen": {
    name: "Lily Aspen",
    studentId: "A20223456",
    photo: null,
    bio: "Plant-based food lover and nutrition major. Making vegan food that even meat-eaters love! Healthy, delicious, and sustainable.",
    location: "MSV",
    transactions: [
      {
        id: 9,
        buyerName: "Mina M.",
        itemName: "Beyond Burger Deluxe",
        price: 8,
        date: "Nov 16, 2025",
        rating: 5,
        review: "Couldn't even tell it was plant-based! Amazing."
      },
      {
        id: 10,
        buyerName: "Carlos R.",
        itemName: "Vegan Buddha Bowl",
        price: 9,
        date: "Nov 13, 2025",
        rating: 5,
        review: "So fresh and filling! Love the tahini dressing."
      }
    ]
  },
  "Emma Baker": {
    name: "Emma Baker",
    studentId: "A20256789",
    photo: null,
    bio: "Baking is my passion! Homemade cookies, brownies, and treats made with love. Everything from scratch, no preservatives!",
    location: "Rowe North",
    transactions: [
      {
        id: 11,
        buyerName: "Suki S.",
        itemName: "Chocolate Chip Cookies",
        price: 3,
        date: "Nov 15, 2025",
        rating: 5,
        review: "OMG these are incredible! Soft, chewy, perfect!"
      },
      {
        id: 12,
        buyerName: "Marco M.",
        itemName: "Double Chocolate Cookies",
        price: 3,
        date: "Nov 14, 2025",
        rating: 5,
        review: "Best cookies on campus, no contest!"
      },
      {
        id: 13,
        buyerName: "May N.",
        itemName: "Snickerdoodles",
        price: 3,
        date: "Nov 10, 2025",
        rating: 5,
        review: "Tastes like home. Thank you Emma!"
      }
    ]
  },
  "May Nok": {
    name: "May Nok",
    studentId: "A20267890",
    photo: null,
    bio: "Thai cuisine specialist from Bangkok! Authentic flavors from my mother's recipes. Every dish is made fresh with traditional techniques.",
    location: "Rowe South",
    transactions: [
      {
        id: 14,
        buyerName: "Chris G.",
        itemName: "Pad Thai",
        price: 9,
        date: "Nov 12, 2025",
        rating: 5,
        review: "Absolutely authentic! Best Thai food I've had in Chicago."
      },
      {
        id: 15,
        buyerName: "Lily A.",
        itemName: "Green Curry",
        price: 10,
        date: "Nov 8, 2025",
        rating: 5,
        review: "Perfect spice level and so fragrant!"
      }
    ]
  },
  "Mina Minato": {
    name: "Mina Minato",
    studentId: "A20278901",
    photo: null,
    bio: "Sushi chef trained by my grandmother in Tokyo. Only the freshest ingredients! Traditional techniques with modern creativity.",
    location: "Rowe Middle",
    transactions: [
      {
        id: 16,
        buyerName: "Lily A.",
        itemName: "Dragon Roll",
        price: 12,
        date: "Nov 11, 2025",
        rating: 5,
        review: "Restaurant-quality sushi! Beautiful presentation too."
      },
      {
        id: 17,
        buyerName: "May N.",
        itemName: "California Roll",
        price: 8,
        date: "Nov 8, 2025",
        rating: 5,
        review: "So fresh! Mina is incredibly skilled."
      }
    ]
  },
  "Chris Green": {
    name: "Chris Green",
    studentId: "A20289012",
    photo: null,
    bio: "Health and wellness enthusiast! Organic smoothies and fresh juices. All natural ingredients, no added sugar or artificial anything!",
    location: "The Quad",
    transactions: [
      {
        id: 18,
        buyerName: "Emma B.",
        itemName: "Berry Blast Smoothie",
        price: 6,
        date: "Nov 13, 2025",
        rating: 5,
        review: "So refreshing and actually tasty without added sugar!"
      },
      {
        id: 19,
        buyerName: "Carlos R.",
        itemName: "Green Detox Smoothie",
        price: 7,
        date: "Nov 10, 2025",
        rating: 4,
        review: "Healthy and energizing! Perfect post-workout."
      }
    ]
  }
};

export const mockFoodItems: FoodItem[] = [
  {
    id: 1,
    name: "Spicy Miso Ramen",
    seller: "Suki Sakamoto",
    price: 9,
    image: "🍜",
    location: "Cunningham Hall",
    rating: "5.0",
    description: "Rich miso broth with perfect spice"
  },
  {
    id: 2,
    name: "Classic Cheese Pizza",
    seller: "Marco Marino",
    price: 5,
    image: "🍕",
    location: "Kacek Hall",
    rating: "4.7",
    description: "NY-style with fresh mozzarella"
  },
  {
    id: 3,
    name: "Chicken Tacos",
    seller: "Carlos Rodriguez",
    price: 6,
    image: "🌮",
    location: "Carmen Hall",
    rating: "5.0",
    description: "Grilled chicken with homemade salsa"
  },
  {
    id: 4,
    name: "Beyond Burger Deluxe",
    seller: "Lily Aspen",
    price: 8,
    image: "🍔",
    location: "MSV",
    rating: "5.0",
    description: "Plant-based perfection with all toppings"
  },
  {
    id: 5,
    name: "Chocolate Chip Cookies",
    seller: "Emma Baker",
    price: 3,
    image: "🍪",
    location: "Rowe North",
    rating: "5.0",
    description: "Fresh-baked soft and chewy cookies"
  },
  {
    id: 6,
    name: "Pad Thai",
    seller: "May Nok",
    price: 9,
    image: "🍝",
    location: "Rowe South",
    rating: "5.0",
    description: "Authentic Thai noodles from Bangkok"
  },
  {
    id: 7,
    name: "California Roll",
    seller: "Mina Minato",
    price: 8,
    image: "🍣",
    location: "Rowe Middle",
    rating: "5.0",
    description: "Fresh sushi with crab and avocado"
  },
  {
    id: 8,
    name: "Berry Blast Smoothie",
    seller: "Chris Green",
    price: 6,
    image: "🥤",
    location: "The Quad",
    rating: "4.5",
    description: "Mixed berry smoothie, no added sugar"
  }
];