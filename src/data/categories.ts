export interface SubCategory {
  id: string
  name: string
  slug: string
  description: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  subcategories: SubCategory[]
}

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and electronic devices',
    subcategories: [
      {
        id: '1-1',
        name: 'Mobile Phones',
        slug: 'mobile-phones',
        description: 'Smartphones, feature phones, and accessories',
      },
      {
        id: '1-2',
        name: 'Laptops',
        slug: 'laptops',
        description: 'Notebooks, gaming laptops, and ultrabooks',
      },
      {
        id: '1-3',
        name: 'Tablets',
        slug: 'tablets',
        description: 'iPads, Android tablets, and e-readers',
      },
      {
        id: '1-4',
        name: 'Cameras',
        slug: 'cameras',
        description: 'DSLR, mirrorless, and action cameras',
      },
    ],
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, accessories, and footwear',
    subcategories: [
      {
        id: '2-1',
        name: 'Shoes',
        slug: 'shoes',
        description: 'Sneakers, boots, sandals, and more',
      },
      {
        id: '2-2',
        name: 'Watches',
        slug: 'watches',
        description: 'Luxury watches, smartwatches, and vintage timepieces',
      },
      {
        id: '2-3',
        name: 'Bags',
        slug: 'bags',
        description: 'Handbags, backpacks, and travel bags',
      },
      {
        id: '2-4',
        name: 'Jewelry',
        slug: 'jewelry',
        description: 'Rings, necklaces, bracelets, and earrings',
      },
    ],
  },
  {
    id: '3',
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Furniture, decor, and gardening supplies',
    subcategories: [
      {
        id: '3-1',
        name: 'Furniture',
        slug: 'furniture',
        description: 'Sofas, tables, chairs, and bedroom sets',
      },
      {
        id: '3-2',
        name: 'Kitchen',
        slug: 'kitchen',
        description: 'Appliances, cookware, and utensils',
      },
      {
        id: '3-3',
        name: 'Garden Tools',
        slug: 'garden-tools',
        description: 'Lawn mowers, trimmers, and hand tools',
      },
      {
        id: '3-4',
        name: 'Home Decor',
        slug: 'home-decor',
        description: 'Wall art, rugs, curtains, and lighting',
      },
    ],
  },
  {
    id: '4',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Sports equipment and outdoor gear',
    subcategories: [
      {
        id: '4-1',
        name: 'Fitness',
        slug: 'fitness',
        description: 'Gym equipment, weights, and yoga mats',
      },
      {
        id: '4-2',
        name: 'Camping',
        slug: 'camping',
        description: 'Tents, sleeping bags, and hiking gear',
      },
      {
        id: '4-3',
        name: 'Cycling',
        slug: 'cycling',
        description: 'Bikes, helmets, and cycling accessories',
      },
      {
        id: '4-4',
        name: 'Water Sports',
        slug: 'water-sports',
        description: 'Kayaks, surfboards, and diving equipment',
      },
    ],
  },
  {
    id: '5',
    name: 'Collectibles',
    slug: 'collectibles',
    description: 'Rare items, antiques, and memorabilia',
    subcategories: [
      {
        id: '5-1',
        name: 'Coins',
        slug: 'coins',
        description: 'Rare coins, currency, and numismatics',
      },
      {
        id: '5-2',
        name: 'Art',
        slug: 'art',
        description: 'Paintings, sculptures, and prints',
      },
      {
        id: '5-3',
        name: 'Stamps',
        slug: 'stamps',
        description: 'Rare stamps and philatelic items',
      },
      {
        id: '5-4',
        name: 'Vintage Toys',
        slug: 'vintage-toys',
        description: 'Classic toys, action figures, and collectibles',
      },
    ],
  },
  {
    id: '6',
    name: 'Automotive',
    slug: 'automotive',
    description: 'Vehicles, parts, and accessories',
    subcategories: [
      {
        id: '6-1',
        name: 'Cars',
        slug: 'cars',
        description: 'Sedans, SUVs, sports cars, and classics',
      },
      {
        id: '6-2',
        name: 'Motorcycles',
        slug: 'motorcycles',
        description: 'Sport bikes, cruisers, and vintage motorcycles',
      },
      {
        id: '6-3',
        name: 'Parts & Accessories',
        slug: 'parts-accessories',
        description: 'Replacement parts, wheels, and car accessories',
      },
      {
        id: '6-4',
        name: 'Tools',
        slug: 'tools',
        description: 'Diagnostic tools, repair equipment, and garage tools',
      },
    ],
  },
]
