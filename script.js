/**
 * ==========================================================================
 * BOOKNOOK – BOOKS & STATIONERY
 * Master Application Engine & State Architecture
 * Task ID: WD-EC-005 | Student Code: DAS-EC-005
 * ==========================================================================
 */

// ==========================================================================
// 0. INDIAN COMMERCE CONSTANTS & SHARED PRICE FORMATTER
// ==========================================================================
const CURRENCY = '\u20b9';                 // Indian Rupee
const FREE_SHIPPING_THRESHOLD = 999;       // FREE shipping at ₹999 and above
const SHIPPING_FEE = 79;                   // Flat ₹79 below the threshold
const EXPRESS_SHIPPING_FEE = 149;          // Express upgrade
const GST_RATE = 0.05;                     // Simulated 5% GST
const GIFT_WRAP_FEE = 49;                  // ₹49 per gift-wrapped item

// Fallback artwork used whenever a product image fails to load
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';

/**
 * The single source of truth for money rendering across the whole app.
 * Uses Indian digit grouping (₹1,299 / ₹12,999 / ₹1,25,000).
 */
function formatPrice(amount) {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;
  // Whole rupees for clean bookstore pricing; paise only when they exist.
  const hasPaise = Math.abs(safe % 1) > 0.004;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: hasPaise ? 2 : 0,
      maximumFractionDigits: hasPaise ? 2 : 0
    }).format(safe);
  } catch (err) {
    return CURRENCY + Math.round(safe).toLocaleString('en-IN');
  }
}

// Human-readable labels for the INR price filter buckets
const PRICE_RANGE_LABELS = {
  'all': 'All Prices',
  'under-300': 'Under \u20b9300',
  '300-600': '\u20b9300 \u2013 \u20b9600',
  '600-1000': '\u20b9600 \u2013 \u20b91,000',
  'over-1000': '\u20b91,000 & Above'
};

// Indian states & union territories for the checkout address form
const INDIAN_STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

// The four main categories and their subcategories (drives nav + filters)
const CATEGORY_TREE = {
  'Fiction': ['Literary Fiction', 'Mystery & Thriller', 'Science Fiction', 'Fantasy', 'Romance'],
  'Non-Fiction': ['Biographies', 'Self-Help', 'History', 'Science', 'Business & Finance'],
  "Children's Books": ['Picture Books', 'Story Books', 'Educational Books', 'Activity Books', 'Board Books'],
  'Stationery': ['Notebooks & Journals', 'Pens & Pencils', 'Art Supplies', 'Desk Accessories', 'Gift Sets']
};

const CATEGORY_META = {
  'Fiction': { icon: '\u{1F4D6}', blurb: 'Literary voices, gripping mysteries and worlds worth getting lost in.' },
  'Non-Fiction': { icon: '\u{1F9E0}', blurb: 'Ideas, history and habits that quietly reshape how you think.' },
  "Children's Books": { icon: '\u{1F9F8}', blurb: 'Picture books, bedtime stories and activity sets for young readers.' },
  'Stationery': { icon: '\u{270F}\u{FE0F}', blurb: 'Notebooks, fountain pens and desk companions for every reader.' }
};

// Application State Store
const state = {

  products: [],
  cart: [],
  wishlist: [],
  user: null,
  orders: [],
  addresses: [],
  activeCoupon: null,
  filters: {
    search: '',
    category: 'all',
    subcategory: 'all',
    author: 'all',
    type: 'all',
    priceRange: 'all',
    minRating: 0,
    language: 'all',
    sort: 'featured'
  },
  currentView: 'home',
  checkoutStep: 1,
  checkoutData: {
    shippingMethod: 'standard',
    paymentMethod: 'card',
    giftWrap: false,
    giftNote: '',
    address: {}
  }
};

// ==========================================================================
// 1. PRODUCT DATASET (35+ Books & 15+ Stationery Products)
// ==========================================================================
const PRODUCTS_DATA = [
  // --- FICTION BOOKS ---
  {
    id: 'bk-fic-01',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    category: 'Fiction',
    subcategory: 'Literary Fiction',
    type: 'book',
    price: 499,
    oldPrice: 699,
    rating: 4.8,
    reviews: 1420,
    language: 'English',
    publisher: 'Viking Press',
    isbn: '978-0525559474',
    pages: 304,
    publishYear: 2020,
    badge: 'Bestseller',
    description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
    image: 'https://theartbar.in/cdn/shop/files/THE_MIDNIGHT_LIBRARY.jpg?v=1745227829',
    featured: true
  },
  {
    id: 'bk-fic-02',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    category: 'Fiction',
    subcategory: 'Mystery & Thriller',
    type: 'book',
    price: 399,
    oldPrice: 599,
    rating: 4.7,
    reviews: 980,
    language: 'English',
    publisher: 'Celadon Books',
    isbn: '978-1250301696',
    pages: 336,
    publishYear: 2019,
    badge: 'Popular',
    description: 'Alicia Berenson’s life is seemingly perfect. One evening she shoots her husband five times in the face and never speaks another word. Theo Faber is a psychotherapist determined to unravel the mystery.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHvwymi6tTNbQ8Go1UzKEPaFjMETFIb-X4zwz6DEY711mxrYMhDu3FaHs&s=10',
    featured: true
  },
  {
    id: 'bk-fic-03',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    category: 'Fiction',
    subcategory: 'Science Fiction',
    type: 'book',
    price: 649,
    oldPrice: 899,
    rating: 4.9,
    reviews: 1840,
    language: 'English',
    publisher: 'Ballantine Books',
    isbn: '978-0593135204',
    pages: 496,
    publishYear: 2021,
    badge: 'Staff Pick',
    description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself are doomed. Except right now, he doesn’t remember his own name.',
    image: 'https://images.squarespace-cdn.com/content/v1/5f7225834e8e3e72253bcc35/1621355049952-Z18N9D1JSTES10PCI69K/project+hail+mary.jpg',
    featured: true
  },
  {
    id: 'bk-fic-04',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    category: 'Fiction',
    subcategory: 'Fantasy',
    type: 'book',
    price: 699,
    oldPrice: 999,
    rating: 4.9,
    reviews: 2100,
    language: 'English',
    publisher: 'DAW Books',
    isbn: '978-0756404741',
    pages: 662,
    publishYear: 2007,
    badge: 'Bestseller',
    description: 'Told in Kvothe’s own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen.',
    image: 'https://lazybookcollector.com/media/book_covers/the-name-of-the-wind-patrick-rothfuss/cover_HVHa6xv.jpg'
  },
  {
    id: 'bk-fic-05',
    title: 'Book Lovers',
    author: 'Emily Henry',
    category: 'Fiction',
    subcategory: 'Romance',
    type: 'book',
    price: 349,
    oldPrice: 499,
    rating: 4.6,
    reviews: 760,
    language: 'English',
    publisher: 'Berkley',
    isbn: '978-0593334836',
    pages: 384,
    publishYear: 2022,
    badge: 'New',
    description: 'One summer. Two rivals. A plot twist they didn’t see coming. Nora Stephens is a cutthroat literary agent who keeps bumping into Charlie Lastra, a hypercritical book editor.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZBX8BKbJN72Tdxh1nIUrbsy22P278n-OUFZb_ghViCo6BmGJGLgbdnMrH&s=10'
  },
  {
    id: 'bk-fic-06',
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel García Márquez',
    category: 'Fiction',
    subcategory: 'Literary Fiction',
    type: 'book',
    price: 549,
    oldPrice: 799,
    rating: 4.9,
    reviews: 3200,
    language: 'Spanish',
    publisher: 'Harper & Row',
    isbn: '978-0060883287',
    pages: 417,
    publishYear: 1967,
    badge: 'Classic',
    description: 'The brilliant chronicle of the rise and fall, the birth and death of the mythical town of Macondo through the history of the Buendía family.',
    image: 'https://miro.medium.com/1*BQzhiSaFf3X_mvZGvJp29w.jpeg'
  },
  {
    id: 'bk-fic-07',
    title: 'Norwegian Wood',
    author: 'Haruki Murakami',
    category: 'Fiction',
    subcategory: 'Literary Fiction',
    type: 'book',
    price: 475,
    oldPrice: 650,
    rating: 4.7,
    reviews: 1540,
    language: 'Japanese',
    publisher: 'Vintage International',
    isbn: '978-0375704024',
    pages: 296,
    publishYear: 1987,
    badge: 'Popular',
    description: 'Toru Okada looks back on his student days in Tokyo during the turbulent late 1960s and his passionate connections with two distinctly different women.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIZDGxtdBiL_DTl7r7hwucA4pEhSi6R74bhenMpGlgPO7Rrc6jkL-Jk9Q&s=10'
  },
  {
    id: 'bk-fic-08',
    title: 'To the Lighthouse',
    author: 'Virginia Woolf',
    category: 'Fiction',
    subcategory: 'Literary Fiction',
    type: 'book',
    price: 299,
    oldPrice: 425,
    rating: 4.5,
    reviews: 640,
    language: 'English',
    publisher: 'Hogarth Press',
    isbn: '978-0156907392',
    pages: 209,
    publishYear: 1927,
    badge: 'Classic',
    description: 'A serene and moving meditation on family life, loss, and the passage of time on the Isle of Skye in Scotland.',
    image: 'https://images.squarespace-cdn.com/content/v1/5c374c9f5ffd203853e32183/1671058143734-SNX7D4EWCBOY9978KSU7/ToTheLighthouse.jpg?format=1000w'
  },
  {
    id: 'bk-fic-09',
    title: 'Dune',
    author: 'Frank Herbert',
    category: 'Fiction',
    subcategory: 'Science Fiction',
    type: 'book',
    price: 799,
    oldPrice: 1199,
    rating: 4.8,
    reviews: 4100,
    language: 'English',
    publisher: 'Chilton Books',
    isbn: '978-0441172719',
    pages: 896,
    publishYear: 1965,
    badge: 'Bestseller',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.',
    image: 'https://miro.medium.com/1*hvRzy37t1JpT_ELtkedIhw.jpeg'
  },
  {
    id: 'bk-fic-10',
    title: 'Americanah',
    author: 'Chimamanda Ngozi Adichie',
    category: 'Fiction',
    subcategory: 'Literary Fiction',
    type: 'book',
    price: 525,
    oldPrice: 750,
    rating: 4.8,
    reviews: 1220,
    language: 'English',
    publisher: 'Knopf',
    isbn: '978-0307455925',
    pages: 477,
    publishYear: 2013,
    badge: 'Staff Pick',
    description: 'A powerful, tender story of race and identity spanning three continents, tracing the lives of two young Nigerians navigating immigration, love, and belonging.',
    image: 'https://images.squarespace-cdn.com/content/v1/63d9364fe9fbbb42b22afb61/70086efa-d506-47e4-9fe2-d864c2551c32/Americanah.jpg'
  },

  // --- NON-FICTION BOOKS ---
  {
    id: 'bk-nf-01',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Non-Fiction',
    subcategory: 'Self-Help',
    type: 'book',
    price: 599,
    oldPrice: 899,
    rating: 4.9,
    reviews: 5800,
    language: 'English',
    publisher: 'Avery',
    isbn: '978-0735211292',
    pages: 320,
    publishYear: 2018,
    badge: 'Bestseller',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day. Learn how to make time for new habits, overcome lack of motivation, and achieve remarkable results.',
    image: 'https://cdn.shopify.com/s/files/1/0194/2855/files/atomic-habits_600x600.jpg?v=1624825894',
    featured: true
  },
  {
    id: 'bk-nf-02',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'Non-Fiction',
    subcategory: 'History',
    type: 'book',
    price: 749,
    oldPrice: 1099,
    rating: 4.8,
    reviews: 3900,
    language: 'English',
    publisher: 'Harper',
    isbn: '978-0062316097',
    pages: 498,
    publishYear: 2015,
    badge: 'Bestseller',
    description: 'Explore how biology and history have defined us and enhanced our understanding of what it means to be "human". From archaic humans to modern global empires.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFK0kgxYCm4d2YBSPN026qvNoM0ng034alRn8Fb8DEIxw2kK7nr9rx2Mo&s=10',
    featured: true
  },
  {
    id: 'bk-nf-03',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    category: 'Non-Fiction',
    subcategory: 'Business & Finance',
    type: 'book',
    price: 399,
    oldPrice: 599,
    rating: 4.8,
    reviews: 2450,
    language: 'English',
    publisher: 'Harriman House',
    isbn: '978-0857197689',
    pages: 256,
    publishYear: 2020,
    badge: 'Popular',
    description: 'Timeless lessons on wealth, greed, and happiness. Doing well with money isn’t necessarily about what you know. It’s about how you behave.',
    image: 'https://media.licdn.com/dms/image/v2/D4D12AQFp56iKRCdxkg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1660860586437?e=2147483647&v=beta&t=6lYPuKmCixD6YQl4g2sIn5pERQ1xqxR1AlI77ROB1Uo'
  },
  {
    id: 'bk-nf-04',
    title: 'Cosmos',
    author: 'Carl Sagan',
    category: 'Non-Fiction',
    subcategory: 'Science',
    type: 'book',
    price: 699,
    oldPrice: 950,
    rating: 4.9,
    reviews: 1900,
    language: 'English',
    publisher: 'Random House',
    isbn: '978-0345331359',
    pages: 365,
    publishYear: 1980,
    badge: 'Classic',
    description: 'Carl Sagan retraces the fifteen billion years of cosmic evolution that have transformed matter into consciousness, exploring science and philosophical wonder.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK8aP1-pAP8ZwvN38VgDkaRzd3_djMD4QCPbVBS0SH-KhxNXdC_NqmyuI&s=10'
  },
  {
    id: 'bk-nf-05',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    category: 'Non-Fiction',
    subcategory: 'Biographies',
    type: 'book',
    price: 899,
    oldPrice: 1299,
    rating: 4.7,
    reviews: 2100,
    language: 'English',
    publisher: 'Simon & Schuster',
    isbn: '978-1451648539',
    pages: 656,
    publishYear: 2011,
    badge: 'Popular',
    description: 'Based on more than forty interviews with Steve Jobs conducted over two years, this is the riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur.',
    image: 'https://nbrissonbookblog.com/wp-content/uploads/2025/04/steve-jobs-bio-cnn.jpg'
  },
  {
    id: 'bk-nf-06',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Non-Fiction',
    subcategory: 'Science',
    type: 'book',
    price: 649,
    oldPrice: 899,
    rating: 4.7,
    reviews: 2800,
    language: 'English',
    publisher: 'Farrar, Straus and Giroux',
    isbn: '978-0374533557',
    pages: 499,
    publishYear: 2011,
    badge: 'Staff Pick',
    description: 'The monumental work on human cognitive biases, behavioral economics, and the two systems that drive the way we think and make judgments.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc63ayrmi3jYdaLaK9hpQ1mf1a4oqZ6wAfBHF1UY_-7fO8LAHWWy9w7wWj&s=10'
  },
  {
    id: 'bk-nf-07',
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'Non-Fiction',
    subcategory: 'Self-Help',
    type: 'book',
    price: 549,
    oldPrice: 750,
    rating: 4.8,
    reviews: 1650,
    language: 'English',
    publisher: 'Grand Central Publishing',
    isbn: '978-1455586691',
    pages: 304,
    publishYear: 2016,
    badge: 'Popular',
    description: 'Rules for focused success in a distracted world. Deep work is the ability to focus without distraction on a cognitively demanding task.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2022/2/JN/OT/TH/147304712/whatsapp-image-2022-02-11-at-3-26-48-pm.jpeg'
  },
  {
    id: 'bk-nf-08',
    title: 'Educated: A Memoir',
    author: 'Tara Westover',
    category: 'Non-Fiction',
    subcategory: 'Biographies',
    type: 'book',
    price: 499,
    oldPrice: 725,
    rating: 4.8,
    reviews: 3100,
    language: 'English',
    publisher: 'Random House',
    isbn: '978-0399590504',
    pages: 352,
    publishYear: 2018,
    badge: 'Bestseller',
    description: 'An unforgettable memoir about a young girl who, kept out of school and isolated from society, leaves her survivalist family and earns a PhD from Cambridge University.',
    image: 'https://thebookishbulletin.wordpress.com/wp-content/uploads/2018/11/whatsapp-image-2018-10-20-at-9-12-35-pm.jpeg'
  },

  // --- CHILDREN'S BOOKS ---
  {
    id: 'bk-ch-01',
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    category: 'Children\'s Books',
    subcategory: 'Story Books',
    type: 'book',
    price: 249,
    oldPrice: 399,
    rating: 4.9,
    reviews: 4500,
    language: 'French',
    publisher: 'Reynal & Hitchcock',
    isbn: '978-0156012195',
    pages: 96,
    publishYear: 1943,
    badge: 'Classic',
    description: 'A poetic tale with watercolor illustrations by the author, in which a pilot stranded in the desert meets a young prince fallen to Earth from a tiny asteroid.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdRJqiv0rkuh7FK1mIAW8pYEQjGgmq7dfcnDENp_FJbqegsdrkt2ms5-s&s=10',
    featured: true
  },
  {
    id: 'bk-ch-02',
    title: 'Where the Wild Things Are',
    author: 'Maurice Sendak',
    category: 'Children\'s Books',
    subcategory: 'Picture Books',
    type: 'book',
    price: 399,
    oldPrice: 550,
    rating: 4.9,
    reviews: 2900,
    language: 'English',
    publisher: 'Harper & Row',
    isbn: '978-0060254926',
    pages: 48,
    publishYear: 1963,
    badge: 'Classic',
    description: 'Maurice Sendak’s Caldecott Medal-winning picture book has become one of the most highly acclaimed and best-loved children’s books of all time.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfRqTngGKRktxbGX4gpw33HOzUINTjqNN-KAK3IIhZbfjRUrmUJgO0Yccc&s=10'
  },
  {
    id: 'bk-ch-03',
    title: 'The Very Hungry Caterpillar',
    author: 'Eric Carle',
    category: 'Children\'s Books',
    subcategory: 'Board Books',
    type: 'book',
    price: 299,
    oldPrice: 425,
    rating: 4.9,
    reviews: 3800,
    language: 'English',
    publisher: 'World Publishing Company',
    isbn: '978-0399226908',
    pages: 32,
    publishYear: 1969,
    badge: 'Bestseller',
    description: 'The all-time classic story following the metamorphosis of a green caterpillar into a glorious butterfly with distinctive interactive cut-out pages.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGIXObVkaaeTxg1Tntms0ghlWJa5iQD58TZtDk6mzxKAL3I4jETGTH6_yh&s=10'
  },
  {
    id: 'bk-ch-04',
    title: 'National Geographic Little Kids First Big Book of Space',
    author: 'Catherine D. Hughes',
    category: 'Children\'s Books',
    subcategory: 'Educational Books',
    type: 'book',
    price: 549,
    oldPrice: 799,
    rating: 4.8,
    reviews: 1400,
    language: 'English',
    publisher: 'National Geographic Kids',
    isbn: '978-1426310140',
    pages: 128,
    publishYear: 2012,
    badge: 'New',
    description: 'This charming reference book takes young space explorers on an unforgettable voyage through our solar system with vivid photography and simple facts.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH3nLgMRQMJ0o7JLCuBm5NN7WOEKpN4sRzLVGmPLZG1A&s'
  },
  {
    id: 'bk-ch-05',
    title: 'Ultimate Sticker Book: Amazing Animals',
    author: 'DK Publishing',
    category: 'Children\'s Books',
    subcategory: 'Activity Books',
    type: 'book',
    price: 199,
    oldPrice: 299,
    rating: 4.6,
    reviews: 820,
    language: 'English',
    publisher: 'DK Children',
    isbn: '978-0756614546',
    pages: 32,
    publishYear: 2021,
    badge: 'Sale',
    description: 'Packed with over 250 reusable stickers of tigers, elephants, ocean creatures, and birds, alongside fun trivia and interactive learning activities.',
    image: 'https://i.ebayimg.com/images/g/bdIAAeSwHGxpwdcA/s-l400.jpg'
  },

  // --- STATIONERY PRODUCTS ---
  {
    id: 'st-01',
    title: 'Artisanal Hardcover Leather Journal',
    author: 'BookNook Atelier',
    category: 'Stationery',
    subcategory: 'Notebooks & Journals',
    type: 'stationery',
    price: 899,
    oldPrice: 1299,
    rating: 4.9,
    reviews: 530,
    language: 'N/A',
    publisher: 'BookNook Crafts',
    isbn: 'STN-JRN-01',
    pages: 240,
    publishYear: 2024,
    badge: 'Bestseller',
    description: 'Handcrafted full-grain leather bound journal with 120gsm fountain-pen friendly acid-free ivory pages, satin ribbon marker, and an expandable rear pocket.',
    image: 'https://m.media-amazon.com/images/I/810p1uVhDbL.jpg',
    featured: true
  },
  {
    id: 'st-02',
    title: 'Classic Brass Fountain Pen Set',
    author: 'Heritage Guild',
    category: 'Stationery',
    subcategory: 'Pens & Pencils',
    type: 'stationery',
    price: 999,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 340,
    language: 'N/A',
    publisher: 'Heritage Guild',
    isbn: 'STN-PEN-02',
    pages: 0,
    publishYear: 2023,
    badge: 'Staff Pick',
    description: 'Precision-machined solid brass fountain pen with medium iridium nib. Includes ink converter, 6 black cartridges, and an embossed storage tin.',
    image: 'https://imagescdn.thecollective.in/img/app/product/9/951426-12276968.jpg?asp=true&crop=700&auto=format',
    featured: true
  },
  {
    id: 'st-03',
    title: 'Botanical Dotted Grid Planner',
    author: 'BookNook Studio',
    category: 'Stationery',
    subcategory: 'Notebooks & Journals',
    type: 'stationery',
    price: 449,
    oldPrice: 649,
    rating: 4.7,
    reviews: 410,
    language: 'N/A',
    publisher: 'BookNook Studio',
    isbn: 'STN-PLN-03',
    pages: 192,
    publishYear: 2024,
    badge: 'New',
    description: 'Foil-stamped linen cover with 5mm dot grid layout, dual ribbons, and undated weekly tracking spreads for mindful productivity.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQLOxWfCdSdw--Hk-SMfoNb-aGFbme7ICzt4OaZbPR0P9deKaHHvPvFWtt&s=10'
  },
  {
    id: 'st-04',
    title: 'Solid Walnut Wooden Bookstand',
    author: 'Nordic Craft',
    category: 'Stationery',
    subcategory: 'Desk Accessories',
    type: 'stationery',
    price: 1299,
    oldPrice: 1799,
    rating: 4.9,
    reviews: 280,
    language: 'N/A',
    publisher: 'Nordic Craft',
    isbn: 'STN-DSK-04',
    pages: 0,
    publishYear: 2024,
    badge: 'Popular',
    description: 'Adjustable reading angle stand made from sustainably harvested American walnut with brass page clips, holding cookbooks, heavy tomes, or tablets.',
    image: 'https://i.etsystatic.com/54679782/r/il/187719/8114355491/il_fullxfull.8114355491_54ce.jpg'
  },
  {
    id: 'st-05',
    title: 'Curated 12-Color Watercolor Palette Kit',
    author: 'Atelier Fine Art',
    category: 'Stationery',
    subcategory: 'Art Supplies',
    type: 'stationery',
    price: 749,
    oldPrice: 1050,
    rating: 4.8,
    reviews: 195,
    language: 'N/A',
    publisher: 'Atelier Fine Art',
    isbn: 'STN-ART-05',
    pages: 0,
    publishYear: 2023,
    badge: 'Staff Pick',
    description: 'Artist-grade pan watercolors in an enameled metal travel box with natural hair brush and water reservoir pen.',
    image: 'https://m.media-amazon.com/images/I/51CFacDhPsL.jpg'
  },
  {
    id: 'st-06',
    title: 'Literary Gift Set: Candle & Brass Bookmark',
    author: 'BookNook Curations',
    category: 'Stationery',
    subcategory: 'Gift Sets',
    type: 'stationery',
    price: 1199,
    oldPrice: 1599,
    rating: 4.9,
    reviews: 310,
    language: 'N/A',
    publisher: 'BookNook Curations',
    isbn: 'STN-GFT-06',
    pages: 0,
    publishYear: 2024,
    badge: 'Bestseller',
    description: 'A cozy sensory box containing an 8oz hand-poured soy candle (scents of old paper & cedarwood), an engraved brass filigree bookmark, and reading tea.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqoYZeCbyjMQB9oQuvmJvXZ2q1w7KiN0LRX5rSzBWmD4OLPyhbiHXnz_o&s=10'
  },
  {
    id: 'st-07',
    title: 'Graphite Sketching Pencil Set (12 Grades)',
    author: 'Heritage Guild',
    category: 'Stationery',
    subcategory: 'Pens & Pencils',
    type: 'stationery',
    price: 349,
    oldPrice: 499,
    rating: 4.7,
    reviews: 260,
    language: 'N/A',
    publisher: 'Heritage Guild',
    isbn: 'STN-PNC-07',
    pages: 0,
    publishYear: 2023,
    badge: 'Sale',
    description: 'Cedarwood graphite pencils ranging from 9B to 2H in a classic metal presentation tin, ideal for book margin annotations and sketches.',
    image: 'https://m.media-amazon.com/images/I/713bgo2i4OL.jpg'
  },
  {
    id: 'st-08',
    title: 'Brass Clip & Book Dart Set (Pack of 22)',
    author: 'BookNook Atelier',
    category: 'Stationery',
    subcategory: 'Desk Accessories',
    type: 'stationery',
    price: 199,
    oldPrice: 299,
    rating: 4.9,
    reviews: 480,
    language: 'N/A',
    publisher: 'BookNook Atelier',
    isbn: 'STN-CLP-08',
    pages: 0,
    publishYear: 2024,
    badge: 'Popular',
    description: 'Paper-thin, archival metal line markers that clip to any page without damaging or indenting paper fibers.',
    image: 'https://m.media-amazon.com/images/I/91eCQFIQr7L._AC_UF350,350_QL80_.jpg'
  },
  {
    id: 'st-09',
    title: 'Cotton Handmade Paper Notebook (A5, Ruled)',
    author: 'BookNook Studio',
    category: 'Stationery',
    subcategory: 'Notebooks & Journals',
    type: 'stationery',
    price: 249,
    oldPrice: 399,
    rating: 4.6,
    reviews: 218,
    language: 'N/A',
    publisher: 'BookNook Studio',
    isbn: 'STN-NTB-09',
    pages: 160,
    publishYear: 2024,
    badge: 'New',
    description: 'Tree-free handmade cotton-rag paper notebook stitched in Jaipur, with a khadi cloth spine and 100gsm ruled pages that take fountain ink beautifully.',
    image: 'https://roohanirang.com/cdn/shop/files/StoriesbyAnshula_RoohaniRang_LR-125_e692c5f6-6388-4384-9415-7857df10e31e.jpg?v=1760583433'
  },
  {
    id: 'st-10',
    title: 'MOKA Classic Pure White Ballpoint Pen (Pack of 5)',
    author: 'Heritage Guild',
    category: 'Stationery',
    subcategory: 'Pens & Pencils',
    type: 'stationery',
    price: 149,
    oldPrice: 225,
    rating: 4.5,
    reviews: 640,
    language: 'N/A',
    publisher: 'Heritage Guild',
    isbn: 'STN-PEN-10',
    pages: 0,
    publishYear: 2024,
    badge: 'Sale',
    description: 'Smooth white 0.5mm ballpoint pen with a clean classic design, comfortable grip, and quick-drying ink.',
    image: 'https://img.ltwebstatic.com/images3_spmp/2023/04/25/16824157857e63d4c3d97304982f0213f9e63795aa_thumbnail_750x999.jpg'
  },
  {
    id: 'st-11',
    title: 'Terracotta Desk Organiser & Pen Stand',
    author: 'Nordic Craft',
    category: 'Stationery',
    subcategory: 'Desk Accessories',
    type: 'stationery',
    price: 599,
    oldPrice: 899,
    rating: 4.7,
    reviews: 176,
    language: 'N/A',
    publisher: 'Nordic Craft',
    isbn: 'STN-DSK-11',
    pages: 0,
    publishYear: 2024,
    badge: 'Popular',
    description: 'Hand-thrown terracotta caddy with three compartments for pens, bookmarks and reading glasses — finished with a matte forest-green glaze.',
    image: 'https://5.imimg.com/data5/ANDROID/Default/2025/10/551611656/SB/KK/KG/227140872/product-jpeg-500x500.jpg'
  },
  {
    id: 'st-12',
    title: 'BENICCI Acrylic Paint & Brush Set (12 Shades)',
    author: 'Atelier Fine Art',
    category: 'Stationery',
    subcategory: 'Art Supplies',
    type: 'stationery',
    price: 449,
    oldPrice: 699,
    rating: 4.6,
    reviews: 302,
    language: 'N/A',
    publisher: 'Atelier Fine Art',
    isbn: 'STN-ART-12',
    pages: 0,
    publishYear: 2024,
    badge: 'New',
    description: 'Student-grade acrylics in 12ml tubes with three taklon brushes and a mixing palette — ideal for journal covers, bookmarks and lettering practice.',
    image: 'https://m.media-amazon.com/images/I/91v1f-xRXgL._AC_UF894,1000_QL80_.jpg'
  }
];

// Authors Database for author spotlight & filter
const AUTHORS_DATA = [
  {
    name: 'Matt Haig',
    genre: 'Fiction & Mental Health',
    bio: 'Author of reasons to stay alive and multiple bestselling novels exploring compassion, time, and second chances.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Virginia Woolf',
    genre: 'Modernist Classic Literature',
    bio: 'Pioneering English writer, regarded as one of the most innovative 20th-century authors and stream of consciousness innovators.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Gabriel García Márquez',
    genre: 'Magical Realism',
    bio: 'Colombian novelist and Nobel laureate who popularized magical realism across world literature with timeless warmth.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'James Clear',
    genre: 'Habits & Productivity',
    bio: 'Specialist in habits and decision making whose work has guided millions to small incremental life improvements.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  }
];

// Sample Testimonials
const REVIEWS_DATA = [
  {
    name: 'Eleanor Vance',
    role: 'Literature Professor',
    comment: 'BookNook brings the warmth and serendipity of an old-world independent bookstore into a crisp, thoughtful digital space. The packaging arrived with a custom bookmark and smelled of fresh paper.',
    rating: 5
  },
  {
    name: 'Marcus Sterling',
    role: 'Architect & Collector',
    comment: 'The stationery collection is extraordinary. The leather journal paired with their brass fountain pen has become my indispensable daily planning companion.',
    rating: 5
  },
  {
    name: 'Sophia Lindqvist',
    role: 'Avid Reader & Book Club Host',
    comment: 'Fast shipping, impeccable curation, and recommendations that actually surprised me. I ordered 4 books last week and they arrived in pristine condition.',
    rating: 5
  }
];

// Available Coupons
const COUPONS = {
  'BOOK10': { code: 'BOOK10', discountPercent: 10, description: '10% off entire order' },
  'READMORE20': { code: 'READMORE20', discountPercent: 20, description: '20% off literary favorites' },
  'WELCOME5': { code: 'WELCOME5', discountAmount: 100, description: '₹100 flat discount for new readers' }
};

// ==========================================================================
// 2. LOCALSTORAGE PERSISTENCE ENGINE
// ==========================================================================
function loadPersistedState() {
  state.products = [...PRODUCTS_DATA];

  try {
    const savedCart = localStorage.getItem('booknook_cart');
    if (savedCart) state.cart = JSON.parse(savedCart);

    const savedWishlist = localStorage.getItem('booknook_wishlist');
    if (savedWishlist) state.wishlist = JSON.parse(savedWishlist);

    const savedUser = localStorage.getItem('booknook_user');
    if (savedUser) state.user = JSON.parse(savedUser);

    const savedOrders = localStorage.getItem('booknook_orders');
    if (savedOrders) state.orders = JSON.parse(savedOrders);

    const savedAddresses = localStorage.getItem('booknook_addresses');
    if (savedAddresses) state.addresses = JSON.parse(savedAddresses);
    else {
      // Default demo address
      state.addresses = [
        {
          id: 'addr-1',
          name: 'Ananya Sharma',
          street: 'Flat 402, Sunview Residency, 12th Main, Indiranagar',
          landmark: 'Near Chinmaya Mission Hospital',
          city: 'Bengaluru',
          state: 'Karnataka',
          zip: '560038',
          phone: '+91 98765 43210',
          isDefault: true
        }
      ];
    }
  } catch (e) {
    console.error('LocalStorage read error:', e);
  }
}

function saveState(key) {
  try {
    if (key === 'cart') localStorage.setItem('booknook_cart', JSON.stringify(state.cart));
    if (key === 'wishlist') localStorage.setItem('booknook_wishlist', JSON.stringify(state.wishlist));
    if (key === 'user') localStorage.setItem('booknook_user', JSON.stringify(state.user));
    if (key === 'orders') localStorage.setItem('booknook_orders', JSON.stringify(state.orders));
    if (key === 'addresses') localStorage.setItem('booknook_addresses', JSON.stringify(state.addresses));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// ==========================================================================
// 3. UI NOTIFICATION (TOAST)
// ==========================================================================
function showToast(message, icon = 'check') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">✨</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================================================
// 4. RENDERING ENGINE
// ==========================================================================

// Helper: Generate Star Icons HTML
function renderStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.4;
  let starsHtml = '';

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHtml += '★';
    } else if (i === fullStars && hasHalf) {
      starsHtml += '★';
    } else {
      starsHtml += '☆';
    }
  }
  return `<span class="stars">${starsHtml}</span>`;
}

// Helper: Render Single Product Card
function renderProductCard(product) {
  const isWishlisted = state.wishlist.includes(product.id);
  const badgeClass = product.badge === 'Bestseller' ? 'badge-forest' :
                     product.badge === 'Sale' ? 'badge-sale' :
                     product.badge === 'Staff Pick' ? 'badge-gold' : 'badge-subtle';

  return `
    <article class="product-card" id="card-${product.id}">
      <div class="product-image-container" onclick="openProductModal('${product.id}')">
        <img 
          src="${product.image}" 
          alt="${product.title}" 
          class="product-image"
          loading="lazy"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';"
        />
        ${product.badge ? `<span class="badge ${badgeClass} product-badge">${product.badge}</span>` : ''}
        <button 
          class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" 
          onclick="event.stopPropagation(); toggleWishlist('${product.id}')"
          title="Add to Wishlist"
          aria-label="Wishlist"
        >
          ${isWishlisted ? '♥' : '♡'}
        </button>
        <div class="product-quick-view">Quick View</div>
      </div>

      <div class="product-meta">${product.category} • ${product.subcategory}</div>
      <h3 class="product-title" onclick="openProductModal('${product.id}')" title="${product.title}">${product.title}</h3>
      <p class="product-author">${product.author}</p>

      <div class="product-rating">
        ${renderStarRating(product.rating)}
        <span class="rating-count">(${product.reviews})</span>
      </div>

      <div class="product-footer">
        <div class="product-price-box">
          <span class="current-price">${formatPrice(product.price)}</span>
          ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
        </div>
        <button class="btn-add-cart" onclick="addToCart('${product.id}')">
          <span>+ Cart</span>
        </button>
      </div>
    </article>
  `;
}

// Render Featured Sections on Home Page
function renderHomePage() {
  // 1. Render Bestsellers
  const bestsellersGrid = document.getElementById('bestsellers-grid');
  if (bestsellersGrid) {
    const bestsellers = state.products.filter(p => p.badge === 'Bestseller' || p.featured).slice(0, 8);
    bestsellersGrid.innerHTML = bestsellers.map(renderProductCard).join('');
  }

  // 2. Render New Arrivals
  const newArrivalsGrid = document.getElementById('new-arrivals-grid');
  if (newArrivalsGrid) {
    const newArrivals = state.products.filter(p => p.badge === 'New' || p.badge === 'Staff Pick').slice(0, 4);
    newArrivalsGrid.innerHTML = newArrivals.map(renderProductCard).join('');
  }

  // 3. Render Stationery Highlights
  const stationeryGrid = document.getElementById('stationery-grid');
  if (stationeryGrid) {
    const stationeryItems = state.products.filter(p => p.type === 'stationery').slice(0, 4);
    stationeryGrid.innerHTML = stationeryItems.map(renderProductCard).join('');
  }

  // 4. Render Authors Grid
  const authorsGrid = document.getElementById('authors-grid');
  if (authorsGrid) {
    authorsGrid.innerHTML = AUTHORS_DATA.map(author => `
      <div class="author-card" onclick="filterByAuthor('${author.name}')">
        <img src="${author.avatar}" alt="${author.name}" class="author-avatar" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';"/>
        <h3>${author.name}</h3>
        <p class="author-genre">${author.genre}</p>
        <p class="author-bio">${author.bio}</p>
        <span class="btn btn-sm btn-secondary" style="margin-top:0.5rem;">Explore Works →</span>
      </div>
    `).join('');
  }

  // 5. Render Reviews Grid
  const reviewsGrid = document.getElementById('reviews-grid');
  if (reviewsGrid) {
    reviewsGrid.innerHTML = REVIEWS_DATA.map(rev => `
      <div class="review-card">
        <div class="product-rating" style="margin-bottom:0.75rem;">
          ${renderStarRating(rev.rating)}
        </div>
        <p>"${rev.comment}"</p>
        <div class="reviewer-meta">
          <div class="reviewer-avatar">${rev.name.charAt(0)}</div>
          <div class="reviewer-info">
            <h4>${rev.name}</h4>
            <span>${rev.role}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Render Catalog / Explore View with Live Filtering & Sorting
function renderCatalog() {
  const container = document.getElementById('catalog-products-grid');
  const countLabel = document.getElementById('catalog-results-count');
  const activeChipsContainer = document.getElementById('active-filters-chips');
  if (!container) return;

  let filtered = [...state.products];

  // 1. Search Query Filter
  if (state.filters.search) {
    const q = state.filters.search.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      (p.publisher && p.publisher.toLowerCase().includes(q)) ||
      (p.isbn && p.isbn.toLowerCase().includes(q))
    );
  }

  // 1b. Author Filter (author spotlight cards)
  if (state.filters.author && state.filters.author !== 'all') {
    filtered = filtered.filter(p => p.author.toLowerCase() === state.filters.author.toLowerCase());
  }

  // 2. Category Filter
  if (state.filters.category !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === state.filters.category.toLowerCase());
  }

  // 3. Subcategory Filter
  if (state.filters.subcategory !== 'all') {
    filtered = filtered.filter(p => p.subcategory.toLowerCase() === state.filters.subcategory.toLowerCase());
  }

  // 4. Type Filter
  if (state.filters.type !== 'all') {
    filtered = filtered.filter(p => p.type === state.filters.type);
  }

  // 5. Price Range Filter
  if (state.filters.priceRange !== 'all') {
    if (state.filters.priceRange === 'under-300') filtered = filtered.filter(p => p.price < 300);
    else if (state.filters.priceRange === '300-600') filtered = filtered.filter(p => p.price >= 300 && p.price <= 600);
    else if (state.filters.priceRange === '600-1000') filtered = filtered.filter(p => p.price > 600 && p.price <= 1000);
    else if (state.filters.priceRange === 'over-1000') filtered = filtered.filter(p => p.price > 1000);
  }

  // 6. Rating Filter
  if (state.filters.minRating > 0) {
    filtered = filtered.filter(p => p.rating >= state.filters.minRating);
  }

  // 7. Language Filter
  if (state.filters.language !== 'all') {
    filtered = filtered.filter(p => p.language.toLowerCase() === state.filters.language.toLowerCase());
  }

  // 8. Sorting
  if (state.filters.sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.filters.sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.filters.sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (state.filters.sort === 'newest') {
    filtered.sort((a, b) => b.publishYear - a.publishYear);
  } else if (state.filters.sort === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Update counts
  if (countLabel) {
    countLabel.innerText = `Showing ${filtered.length} item${filtered.length === 1 ? '' : 's'}`;
  }

  // Render Active Filter Chips
  if (activeChipsContainer) {
    const chips = [];
    if (state.filters.search) chips.push({ label: `Search: "${state.filters.search}"`, key: 'search' });
    if (state.filters.category !== 'all') chips.push({ label: `Category: ${state.filters.category}`, key: 'category' });
    if (state.filters.subcategory !== 'all') chips.push({ label: `Subcategory: ${state.filters.subcategory}`, key: 'subcategory' });
    if (state.filters.author && state.filters.author !== 'all') chips.push({ label: `Author: ${state.filters.author}`, key: 'author' });
    if (state.filters.language !== 'all') chips.push({ label: `Language: ${state.filters.language}`, key: 'language' });
    if (state.filters.type !== 'all') chips.push({ label: `Type: ${state.filters.type}`, key: 'type' });
    if (state.filters.priceRange !== 'all') chips.push({ label: `Price: ${PRICE_RANGE_LABELS[state.filters.priceRange] || state.filters.priceRange}`, key: 'priceRange' });
    if (state.filters.minRating > 0) chips.push({ label: `${state.filters.minRating}★ & Up`, key: 'minRating' });

    if (chips.length > 0) {
      activeChipsContainer.innerHTML = `
        <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">Active Filters:</span>
        ${chips.map(c => `
          <span class="filter-chip">
            ${c.label}
            <button onclick="clearSpecificFilter('${c.key}')" title="Remove filter">✕</button>
          </span>
        `).join('')}
        <button class="btn btn-sm btn-ghost" onclick="resetAllFilters()" style="font-size:0.75rem; text-decoration:underline;">Clear All</button>
      `;
    } else {
      activeChipsContainer.innerHTML = '';
    }
  }

  // Render or Empty State
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📚</div>
        <h3>No Books or Stationery Found</h3>
        <p>We couldn't find any products matching your active filters. Try loosening your search criteria or resetting filters.</p>
        <button class="btn btn-primary" onclick="resetAllFilters()">Reset All Filters</button>
      </div>
    `;
  } else {
    container.innerHTML = filtered.map(renderProductCard).join('');
  }
}

// ==========================================================================
// 5. PRODUCT DETAILS MODAL (PDP)
// ==========================================================================
function openProductModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const modalContainer = document.getElementById('pdp-modal-content');
  const overlay = document.getElementById('pdp-modal');
  if (!modalContainer || !overlay) return;

  const isWishlisted = state.wishlist.includes(product.id);
  const discountPercent = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  
  // Find related products
  const relatedProducts = state.products
    .filter(p => p.id !== product.id && (p.category === product.category || p.author === product.author))
    .slice(0, 3);

  modalContainer.innerHTML = `
    <div class="pdp-grid">
      <div class="pdp-gallery-wrap">
        <div class="pdp-main-image-wrap">
          <img src="${product.image}" alt="${product.title}" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';"/>
        </div>
        <div style="font-size:0.78rem; color:var(--text-light); text-align:center;">
          ✓ Guaranteed Pristine Archival Condition
        </div>
      </div>

      <div class="pdp-info-wrap">
        <div class="product-meta">${product.category} • ${product.subcategory}</div>
        <h2 class="pdp-title">${product.title}</h2>
        <div class="pdp-author">By ${product.author}</div>

        <div class="product-rating" style="margin-bottom:0.75rem;">
          ${renderStarRating(product.rating)}
          <span class="rating-count" style="font-weight:700; color:var(--text-main); margin-left:0.35rem;">${product.rating}</span>
          <span class="rating-count">(${product.reviews} verified reviews)</span>
        </div>

        <div class="pdp-price-row">
          <span class="pdp-price">${formatPrice(product.price)}</span>
          ${product.oldPrice ? `<span class="pdp-old-price">${formatPrice(product.oldPrice)}</span>` : ''}
          ${discountPercent > 0 ? `<span class="pdp-discount-badge">Save ${discountPercent}%</span>` : ''}
        </div>

        <p class="pdp-desc">${product.description}</p>

        <div class="pdp-specs-grid">
          <div class="pdp-spec-item">
            <span>Publisher / Maker</span>
            <span>${product.publisher || 'BookNook Atelier'}</span>
          </div>
          <div class="pdp-spec-item">
            <span>ISBN / Reference</span>
            <span>${product.isbn || 'BN-2024-REF'}</span>
          </div>
          <div class="pdp-spec-item">
            <span>Language</span>
            <span>${product.language || 'English'}</span>
          </div>
          <div class="pdp-spec-item">
            <span>Pages / Format</span>
            <span>${product.pages ? `${product.pages} Pages` : 'Deluxe Format'}</span>
          </div>
        </div>

        <label class="gift-wrap-option">
          <input type="checkbox" id="pdp-gift-wrap-check" style="accent-color:var(--primary-forest); width:18px; height:18px;"/>
          <div>
            <strong>Add Handcrafted Gift Wrapping (+₹49)</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">Includes wax seal, botanical ribbon, and handwritten calligraphy note.</div>
          </div>
        </label>

        <div class="pdp-actions-row">
          <div class="quantity-stepper">
            <button class="stepper-btn" onclick="adjustPdpQty(-1)">-</button>
            <input type="text" id="pdp-qty-input" class="stepper-input" value="1" readonly />
            <button class="stepper-btn" onclick="adjustPdpQty(1)">+</button>
          </div>
          <button class="btn btn-primary" style="flex:1;" onclick="addPdpToCart('${product.id}')">
            <span>Add to Cart</span>
          </button>
          <button 
            class="action-btn" 
            id="pdp-wishlist-btn"
            data-product-id="${product.id}"
            style="width:48px; height:48px; border-radius:var(--radius-md);" 
            onclick="toggleWishlist('${product.id}')"
            title="Wishlist"
          >
            ${isWishlisted ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </div>

    <div class="pdp-tabs">
      <div class="pdp-tab-nav">
        <span class="pdp-tab-btn active">Reader Reviews (${product.reviews})</span>
        <span class="pdp-tab-btn">Shipping & Delivery</span>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <div>
            <h4 style="font-size:1.1rem; color:var(--primary-dark);">Customer Experience</h4>
            <p style="font-size:0.85rem;">Overall Rating: <strong>${product.rating} out of 5</strong></p>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="showToast('Review submitted for moderation! Thank you for sharing your thoughts.')">Write a Review</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:1rem;">
          <div style="background:var(--cream-alt); padding:1rem; border-radius:var(--radius-md);">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
              <strong>Clara Higgins</strong>
              ${renderStarRating(5)}
            </div>
            <p style="font-size:0.88rem; color:var(--text-muted);">"A mesmerizing read that stayed with me for weeks. The binding quality from BookNook was impeccable."</p>
          </div>
          <div style="background:var(--cream-alt); padding:1rem; border-radius:var(--radius-md);">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
              <strong>Arthur Pendelton</strong>
              ${renderStarRating(4.5)}
            </div>
            <p style="font-size:0.88rem; color:var(--text-muted);">"Prompt delivery, lovely paper texture, and excellent protective packaging."</p>
          </div>
        </div>

        ${relatedProducts.length > 0 ? `
          <div style="margin-top:2.5rem; padding-top:1.5rem; border-top:1px solid var(--cream-border);">
            <h4 style="font-size:1.1rem; margin-bottom:1rem;">Readers Also Loved</h4>
            <div class="product-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
              ${relatedProducts.map(renderProductCard).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  overlay.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeProductModal() {
  const overlay = document.getElementById('pdp-modal');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

function adjustPdpQty(delta) {
  const input = document.getElementById('pdp-qty-input');
  if (!input) return;
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(20, val + delta));
  input.value = val;
}

function addPdpToCart(productId) {
  const input = document.getElementById('pdp-qty-input');
  const giftWrapCheck = document.getElementById('pdp-gift-wrap-check');
  const qty = input ? parseInt(input.value) || 1 : 1;
  const giftWrap = giftWrapCheck ? giftWrapCheck.checked : false;

  addToCart(productId, qty, giftWrap);
  closeProductModal();
}

// ==========================================================================
// 6. CART ENGINE & DRAWER
// ==========================================================================
function addToCart(productId, quantity = 1, giftWrap = false) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = state.cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
    if (giftWrap) existingItem.giftWrap = true;
  } else {
    state.cart.push({
      id: product.id,
      title: product.title,
      author: product.author,
      price: product.price,
      image: product.image,
      quantity: quantity,
      giftWrap: giftWrap
    });
  }

  saveState('cart');
  updateNavCounters();
  renderCartDrawer();
  showToast(`Added "${product.title}" to cart!`);
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveState('cart');
  updateNavCounters();
  renderCartDrawer();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  saveState('cart');
  updateNavCounters();
  renderCartDrawer();
  showToast('Item removed from cart.');
}

function clearCart() {
  state.cart = [];
  state.activeCoupon = null;
  saveState('cart');
  updateNavCounters();
  renderCartDrawer();
}

function calculateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Coupon Calculation
  let discount = 0;
  if (state.activeCoupon) {
    if (state.activeCoupon.discountPercent) {
      discount = subtotal * (state.activeCoupon.discountPercent / 100);
    } else if (state.activeCoupon.discountAmount) {
      discount = Math.min(subtotal, state.activeCoupon.discountAmount);
    }
  }

  // Gift wrapping total (₹49 per marked item)
  const giftWrapFee = state.cart.reduce((sum, item) => sum + (item.giftWrap ? GIFT_WRAP_FEE * item.quantity : 0), 0);

  // Shipping: flat ₹79, FREE at ₹999+; express is a paid upgrade
  const isExpress = state.checkoutData.shippingMethod === 'express';
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD && !isExpress;
  let shipping = 0;
  if (subtotal > 0) {
    if (isExpress) shipping = EXPRESS_SHIPPING_FEE;
    else if (!isFreeShipping) shipping = SHIPPING_FEE;
  }

  // Simulated GST (5%)
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * GST_RATE;

  const grandTotal = Math.max(0, taxable + giftWrapFee + shipping + tax);

  return {
    subtotal,
    discount,
    giftWrapFee,
    shipping,
    tax,
    grandTotal,
    isFreeShipping,
    amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  };
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items-body');
  const footerContainer = document.getElementById('cart-footer-content');
  const progressText = document.getElementById('cart-progress-text');
  const progressFill = document.getElementById('cart-progress-fill');
  if (!container) return;

  const totals = calculateCartTotals();

  // Update Free Shipping Bar
  if (progressText && progressFill) {
    if (totals.subtotal >= FREE_SHIPPING_THRESHOLD) {
      progressText.innerHTML = '<span>🎉 You unlocked <strong>FREE Shipping!</strong></span>';
      progressFill.style.width = '100%';
    } else if (totals.subtotal > 0) {
      const pct = (totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100;
      progressText.innerHTML = `<span>Add <strong>${formatPrice(totals.amountToFreeShipping)}</strong> more for FREE Shipping</span> <span>${Math.round(pct)}%</span>`;
      progressFill.style.width = `${pct}%`;
    } else {
      progressText.innerHTML = `<span>Free shipping on orders over <strong>${formatPrice(FREE_SHIPPING_THRESHOLD)}</strong></span>`;
      progressFill.style.width = '0%';
    }
  }

  // Render Items List
  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="border:none; padding:2rem 1rem;">
        <div class="empty-state-icon">🛒</div>
        <h3>Your Cart is Empty</h3>
        <p>Explore our library of classic tomes, contemporary fiction, and artisanal stationery.</p>
        <button class="btn btn-primary" onclick="toggleCartDrawer(false); navigateTo('catalog');">Start Browsing</button>
      </div>
    `;
    if (footerContainer) footerContainer.innerHTML = '';
    return;
  }

  container.innerHTML = state.cart.map(item => `
    <div class="cart-item-row" id="cart-item-${item.id}">
      <img src="${item.image}" alt="${item.title}" class="cart-item-image" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';"/>
      <div class="cart-item-info">
        <h4>${item.title}</h4>
        <p>${item.author}</p>
        <div class="quantity-stepper" style="padding:2px;">
          <button class="stepper-btn" style="width:26px; height:26px;" onclick="updateCartQuantity('${item.id}', -1)">-</button>
          <span class="stepper-input" style="width:30px; font-size:0.85rem;">${item.quantity}</span>
          <button class="stepper-btn" style="width:26px; height:26px;" onclick="updateCartQuantity('${item.id}', 1)">+</button>
        </div>
        ${item.giftWrap ? '<span style="font-size:0.7rem; color:var(--accent-warm); font-weight:700; display:block; margin-top:2px;">🎁 Gift Wrapped (+₹49)</span>' : ''}
      </div>
      <div style="text-align:right;">
        <div class="cart-item-price">${formatPrice((item.price * item.quantity))}</div>
        <button class="cart-item-delete-btn" onclick="removeFromCart('${item.id}')" title="Remove">✕</button>
      </div>
    </div>
  `).join('');

  // Render Footer Breakdown
  if (footerContainer) {
    footerContainer.innerHTML = `
      <div class="coupon-input-wrap">
        <input type="text" id="coupon-input" placeholder="Coupon Code (e.g. BOOK10)" value="${state.activeCoupon ? state.activeCoupon.code : ''}" ${state.activeCoupon ? 'readonly' : ''} />
        ${state.activeCoupon ? `
          <button class="btn btn-sm btn-secondary" onclick="removeCoupon()">Remove</button>
        ` : `
          <button class="btn btn-sm btn-primary" onclick="applyCoupon()">Apply</button>
        `}
      </div>
      ${state.activeCoupon ? `
        <div style="font-size:0.78rem; color:var(--success); font-weight:700; margin-bottom:0.75rem;">
          ✓ Coupon ${state.activeCoupon.code} applied: ${state.activeCoupon.description}
        </div>
      ` : ''}

      <div class="cart-calc-row">
        <span>Items Subtotal</span>
        <span>${formatPrice(totals.subtotal)}</span>
      </div>

      ${totals.discount > 0 ? `
        <div class="cart-calc-row" style="color:var(--success); font-weight:700;">
          <span>Coupon Discount</span>
          <span>-${formatPrice(totals.discount)}</span>
        </div>
      ` : ''}

      ${totals.giftWrapFee > 0 ? `
        <div class="cart-calc-row">
          <span>Gift Wrapping</span>
          <span>+${formatPrice(totals.giftWrapFee)}</span>
        </div>
      ` : ''}

      <div class="cart-calc-row">
        <span>Shipping</span>
        <span>${totals.shipping === 0 ? '<strong style="color:var(--success)">FREE</strong>' : `${formatPrice(totals.shipping)}`}</span>
      </div>

      <div class="cart-calc-row">
        <span>GST (5%)</span>
        <span>${formatPrice(totals.tax)}</span>
      </div>

      <div class="cart-total-row">
        <span>Grand Total</span>
        <span>${formatPrice(totals.grandTotal)}</span>
      </div>

      <button class="btn btn-primary" style="width:100%; padding:0.9rem;" onclick="openCheckoutModal()">
        <span>Proceed to Checkout →</span>
      </button>
    `;
  }
}

function toggleCartDrawer(open = true) {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (!overlay) return;

  if (open) {
    renderCartDrawer();
    overlay.classList.add('active');
    document.body.classList.add('modal-open');
  } else {
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

// ==========================================================================
// 7. COUPON ENGINE
// ==========================================================================
function applyCoupon() {
  const input = document.getElementById('coupon-input');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    showToast('Please enter a coupon code.');
    return;
  }

  if (COUPONS[code]) {
    state.activeCoupon = COUPONS[code];
    renderCartDrawer();
    showToast(`Coupon "${code}" applied successfully!`);
  } else {
    showToast(`Invalid coupon "${code}". Try BOOK10, READMORE20 or WELCOME5.`);
  }
}

function removeCoupon() {
  state.activeCoupon = null;
  renderCartDrawer();
  showToast('Coupon removed.');
}

// ==========================================================================
// 8. WISHLIST ENGINE
// ==========================================================================
function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);
  const product = state.products.find(p => p.id === productId);

  if (index > -1) {
    state.wishlist.splice(index, 1);
    showToast(`Removed "${product ? product.title : 'Item'}" from wishlist.`);
  } else {
    state.wishlist.push(productId);
    showToast(`Added "${product ? product.title : 'Item'}" to wishlist!`);
  }

  saveState('wishlist');
  updateNavCounters();

  // Refresh the PDP wishlist heart immediately if its modal is currently open for this product
  const pdpWishlistBtn = document.getElementById('pdp-wishlist-btn');
  if (pdpWishlistBtn && pdpWishlistBtn.dataset.productId === productId) {
    pdpWishlistBtn.innerHTML = state.wishlist.includes(productId) ? '♥' : '♡';
  }
  if (state.currentView === 'catalog') renderCatalog();
  if (state.currentView === 'home') renderHomePage();
  if (state.currentView === 'account') renderAccountWishlist();
}

function renderAccountWishlist() {
  const container = document.getElementById('account-wishlist-grid');
  if (!container) return;

  const wishlistProducts = state.products.filter(p => state.wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">♥</div>
        <h3>Your Wishlist is Empty</h3>
        <p>Save your favorite novels, poetry collections, and handcrafted stationery for later.</p>
        <button class="btn btn-primary" onclick="navigateTo('catalog')">Explore Catalog</button>
      </div>
    `;
  } else {
    container.innerHTML = wishlistProducts.map(renderProductCard).join('');
  }
}

// ==========================================================================
// 9. CHECKOUT SIMULATION ENGINE
// ==========================================================================
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Your cart is empty.');
    return;
  }
  toggleCartDrawer(false);

  const overlay = document.getElementById('checkout-modal');
  if (!overlay) return;

  state.checkoutStep = 1;
  renderCheckoutStep();

  overlay.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeCheckoutModal() {
  const overlay = document.getElementById('checkout-modal');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

function renderCheckoutStep() {
  const body = document.getElementById('checkout-body');
  const summaryBox = document.getElementById('checkout-summary-container');
  if (!body) return;

  const totals = calculateCartTotals();

  // Render Step Content
  if (state.checkoutStep === 1) {
    body.innerHTML = `
      <div class="checkout-steps-indicator">
        <div class="step-node active"><div class="step-badge">1</div><span>Contact</span></div>
        <div class="step-node"><div class="step-badge">2</div><span>Shipping</span></div>
        <div class="step-node"><div class="step-badge">3</div><span>Payment</span></div>
        <div class="step-node"><div class="step-badge">4</div><span>Review</span></div>
      </div>

      <h3 style="margin-bottom:1rem;">1. Customer & Contact Information</h3>
      <form id="checkout-form-step-1" onsubmit="event.preventDefault(); nextCheckoutStep();">
        <div class="form-group">
          <label for="chk-email">Email Address for Order Confirmation *</label>
          <input type="email" id="chk-email" class="form-control" required placeholder="reader@example.com" value="${state.user ? state.user.email : ''}" />
        </div>
        <div class="form-group">
          <label for="chk-phone">Mobile Phone (For Courier Delivery Updates) *</label>
          <input type="tel" id="chk-phone" class="form-control" required placeholder="98765 43210" inputmode="numeric" maxlength="10" pattern="[6-9][0-9]{9}" value="${state.user ? state.user.phone || '' : ''}" />
        </div>
        <div class="form-group">
          <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
            <input type="checkbox" checked style="accent-color:var(--primary-forest);" />
            <span>Keep me informed of rare book releases and seasonal discounts</span>
          </label>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:2rem;">
          <button type="submit" class="btn btn-primary">Continue to Shipping Address →</button>
        </div>
      </form>
    `;
  } else if (state.checkoutStep === 2) {
    const defaultAddr = state.addresses.find(a => a.isDefault) || state.addresses[0] || {};
    body.innerHTML = `
      <div class="checkout-steps-indicator">
        <div class="step-node completed"><div class="step-badge">✓</div><span>Contact</span></div>
        <div class="step-node active"><div class="step-badge">2</div><span>Shipping</span></div>
        <div class="step-node"><div class="step-badge">3</div><span>Payment</span></div>
        <div class="step-node"><div class="step-badge">4</div><span>Review</span></div>
      </div>

      <h3 style="margin-bottom:1rem;">2. Shipping Address & Delivery Method</h3>
      <form id="checkout-form-step-2" onsubmit="event.preventDefault(); nextCheckoutStep();">
        <div class="form-group">
          <label for="chk-name">Full Recipient Name *</label>
          <input type="text" id="chk-name" class="form-control" required placeholder="Ananya Sharma" autocomplete="name" value="${defaultAddr.name || ''}" />
          <span class="field-error" id="chk-name-error"></span>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label for="chk-house">House / Flat No. *</label>
            <input type="text" id="chk-house" class="form-control" required placeholder="Flat 402, Sunview Residency" value="${defaultAddr.house || ''}" />
            <span class="field-error" id="chk-house-error"></span>
          </div>
          <div class="form-group">
            <label for="chk-street">Street / Area / Locality *</label>
            <input type="text" id="chk-street" class="form-control" required placeholder="MG Road, Indiranagar" value="${defaultAddr.street || ''}" />
            <span class="field-error" id="chk-street-error"></span>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label for="chk-city">City *</label>
            <input type="text" id="chk-city" class="form-control" required placeholder="Bengaluru" value="${defaultAddr.city || ''}" />
            <span class="field-error" id="chk-city-error"></span>
          </div>
          <div class="form-group">
            <label for="chk-pincode">PIN Code *</label>
            <input type="text" id="chk-pincode" class="form-control" required placeholder="560001" inputmode="numeric" maxlength="6" pattern="[1-9][0-9]{5}" value="${defaultAddr.pincode || ''}" />
            <span class="field-error" id="chk-pincode-error"></span>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label for="chk-state">State *</label>
            <select id="chk-state" class="form-control" required>
              <option value="" ${!(state.checkoutData.address.state || defaultAddr.state) ? 'selected' : ''} disabled>Select State</option>
              ${INDIAN_STATES
                .map(st => `<option value="${st}" ${(state.checkoutData.address.state || defaultAddr.state) === st ? 'selected' : ''}>${st}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="chk-landmark">Landmark (Optional)</label>
            <input type="text" id="chk-landmark" class="form-control" placeholder="Opposite City Library" value="${defaultAddr.landmark || ''}" />
          </div>
        </div>

        <h4 style="margin:1.5rem 0 0.75rem;">Delivery Method</h4>
        <div class="delivery-options">
          <label class="delivery-option ${state.checkoutData.shippingMethod === 'standard' ? 'selected' : ''}">
            <input type="radio" name="ship-method" value="standard" ${state.checkoutData.shippingMethod === 'standard' ? 'checked' : ''}
                   onchange="state.checkoutData.shippingMethod='standard'; renderCheckoutStep();" />
            <span class="delivery-copy">
              <strong>Standard Delivery &mdash; 4 to 6 working days</strong>
              <small>${totals.subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE on this order' : formatPrice(SHIPPING_FEE) + ' &middot; FREE above ' + formatPrice(FREE_SHIPPING_THRESHOLD)}</small>
            </span>
          </label>
          <label class="delivery-option ${state.checkoutData.shippingMethod === 'express' ? 'selected' : ''}">
            <input type="radio" name="ship-method" value="express" ${state.checkoutData.shippingMethod === 'express' ? 'checked' : ''}
                   onchange="state.checkoutData.shippingMethod='express'; renderCheckoutStep();" />
            <span class="delivery-copy">
              <strong>Express Delivery &mdash; 1 to 2 working days</strong>
              <small>${formatPrice(EXPRESS_SHIPPING_FEE)} &middot; Packed in protective board sleeves</small>
            </span>
          </label>
        </div>

        <div class="form-group" style="margin-top:1.25rem;">
          <label for="chk-gift-note">Gift Note (Optional, handwritten on our letterpress card)</label>
          <textarea id="chk-gift-note" class="form-control" rows="2" maxlength="180" placeholder="Happy reading, Ananya!">${state.checkoutData.giftNote || ''}</textarea>
        </div>
        <div class="form-group">
          <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
            <input type="checkbox" id="chk-save-address" checked style="accent-color:var(--primary-forest);" />
            <span>Save this address to my BookNook account</span>
          </label>
        </div>

        <div style="display:flex; justify-content:space-between; gap:1rem; margin-top:2rem;">
          <button type="button" class="btn btn-outline" onclick="state.checkoutStep = 1; renderCheckoutStep();">&larr; Back to Contact</button>
          <button type="submit" class="btn btn-primary">Continue to Payment &rarr;</button>
        </div>
      </form>
    `;
  } else if (state.checkoutStep === 3) {
    const method = state.checkoutData.paymentMethod || 'card';
    body.innerHTML = `
      <div class="checkout-steps-indicator">
        <div class="step-node completed"><div class="step-badge">&#10003;</div><span>Contact</span></div>
        <div class="step-node completed"><div class="step-badge">&#10003;</div><span>Shipping</span></div>
        <div class="step-node active"><div class="step-badge">3</div><span>Payment</span></div>
        <div class="step-node"><div class="step-badge">4</div><span>Review</span></div>
      </div>

      <h3 style="margin-bottom:1rem;">3. Payment Method</h3>
      <p class="muted-note">This is a simulated checkout &mdash; no real payment is processed and no card details are stored.</p>
      <form id="checkout-form-step-3" onsubmit="event.preventDefault(); nextCheckoutStep();">
        <div class="payment-options">
          ${[
            { id: 'card', label: 'Credit / Debit Card', note: 'Visa, Mastercard, RuPay &middot; Secure 3D verification' },
            { id: 'upi', label: 'UPI', note: 'Google Pay, PhonePe, Paytm &middot; Instant confirmation' },
            { id: 'netbanking', label: 'Net Banking', note: 'All major Indian banks supported' },
            { id: 'cod', label: 'Cash on Delivery', note: 'Pay the courier when your parcel arrives' }
          ].map(opt => `
            <label class="payment-option ${method === opt.id ? 'selected' : ''}">
              <input type="radio" name="pay-method" value="${opt.id}" ${method === opt.id ? 'checked' : ''}
                     onchange="state.checkoutData.paymentMethod='${opt.id}'; renderCheckoutStep();" />
              <span class="payment-copy">
                <strong>${opt.label}</strong>
                <small>${opt.note}</small>
              </span>
            </label>
          `).join('')}
        </div>

        <div class="payment-fields">
          ${method === 'card' ? `
            <div class="form-group">
              <label for="chk-card-number">Card Number *</label>
              <input type="text" id="chk-card-number" class="form-control" required inputmode="numeric" maxlength="19" placeholder="4111 1111 1111 1111" autocomplete="cc-number" />
            </div>
            <div class="form-grid-2">
              <div class="form-group">
                <label for="chk-card-expiry">Expiry (MM/YY) *</label>
                <input type="text" id="chk-card-expiry" class="form-control" required maxlength="5" placeholder="09/28" autocomplete="cc-exp" />
              </div>
              <div class="form-group">
                <label for="chk-card-cvv">CVV *</label>
                <input type="password" id="chk-card-cvv" class="form-control" required inputmode="numeric" maxlength="4" placeholder="123" autocomplete="cc-csc" />
              </div>
            </div>
            <div class="form-group">
              <label for="chk-card-name">Name on Card *</label>
              <input type="text" id="chk-card-name" class="form-control" required placeholder="ANANYA SHARMA" autocomplete="cc-name" />
            </div>
          ` : method === 'upi' ? `
            <div class="form-group">
              <label for="chk-upi-id">UPI ID *</label>
              <input type="text" id="chk-upi-id" class="form-control" required placeholder="ananya@okbank" />
            </div>
          ` : method === 'netbanking' ? `
            <div class="form-group">
              <label for="chk-bank">Select Your Bank *</label>
              <select id="chk-bank" class="form-control" required>
                ${['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank']
                  .map(bank => `<option value="${bank}">${bank}</option>`).join('')}
              </select>
            </div>
          ` : `
            <p class="cod-note">Please keep <strong>${formatPrice(totals.grandTotal)}</strong> ready for the delivery executive. Cash on Delivery is available on all serviceable PIN codes.</p>
          `}
        </div>

        <div style="display:flex; justify-content:space-between; gap:1rem; margin-top:2rem;">
          <button type="button" class="btn btn-outline" onclick="state.checkoutStep = 2; renderCheckoutStep();">&larr; Back to Shipping</button>
          <button type="submit" class="btn btn-primary">Review Order &rarr;</button>
        </div>
      </form>
    `;
  } else if (state.checkoutStep === 4) {
    const addr = state.checkoutData.address || {};
    const payLabels = { card: 'Credit / Debit Card', upi: 'UPI', netbanking: 'Net Banking', cod: 'Cash on Delivery' };
    body.innerHTML = `
      <div class="checkout-steps-indicator">
        <div class="step-node completed"><div class="step-badge">&#10003;</div><span>Contact</span></div>
        <div class="step-node completed"><div class="step-badge">&#10003;</div><span>Shipping</span></div>
        <div class="step-node completed"><div class="step-badge">&#10003;</div><span>Payment</span></div>
        <div class="step-node active"><div class="step-badge">4</div><span>Review</span></div>
      </div>

      <h3 style="margin-bottom:1rem;">4. Review & Place Your Order</h3>

      <div class="review-block">
        <h4>Delivering To</h4>
        <p>
          <strong>${addr.name || 'BookNook Reader'}</strong><br />
          ${[addr.house, addr.street, addr.landmark].filter(Boolean).join(', ')}<br />
          ${[addr.city, addr.state].filter(Boolean).join(', ')} ${addr.pincode || ''}<br />
          ${state.checkoutData.email ? state.checkoutData.email + ' &middot; ' : ''}${state.checkoutData.phone || ''}
        </p>
      </div>

      <div class="review-block">
        <h4>Delivery & Payment</h4>
        <p>
          ${state.checkoutData.shippingMethod === 'express' ? 'Express Delivery (1&ndash;2 working days)' : 'Standard Delivery (4&ndash;6 working days)'}<br />
          ${payLabels[state.checkoutData.paymentMethod] || payLabels.card}
          ${state.checkoutData.giftNote ? '<br />Gift note: &ldquo;' + state.checkoutData.giftNote + '&rdquo;' : ''}
        </p>
      </div>

      <div class="review-block">
        <h4>Items (${state.cart.reduce((n, i) => n + i.quantity, 0)})</h4>
        <ul class="review-items">
          ${state.cart.map(item => `
            <li>
              <span>${item.title} &times; ${item.quantity}${item.giftWrap ? ' <em>(gift wrapped)</em>' : ''}</span>
              <strong>${formatPrice(item.price * item.quantity)}</strong>
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="display:flex; justify-content:space-between; gap:1rem; margin-top:2rem;">
        <button type="button" class="btn btn-outline" onclick="state.checkoutStep = 3; renderCheckoutStep();">&larr; Back to Payment</button>
        <button type="button" class="btn btn-primary" onclick="placeOrder();">Place Order &middot; ${formatPrice(totals.grandTotal)}</button>
      </div>
    `;
  }

  // Render the sticky order summary that sits beside every checkout step
  if (summaryBox) {
    summaryBox.innerHTML = `
      <h4 class="summary-title">Order Summary</h4>
      <div class="summary-row"><span>Subtotal</span><span>${formatPrice(totals.subtotal)}</span></div>
      ${totals.discount > 0 ? `<div class="summary-row discount"><span>Coupon (${state.activeCoupon ? state.activeCoupon.code : ''})</span><span>-${formatPrice(totals.discount)}</span></div>` : ''}
      ${totals.giftWrapFee > 0 ? `<div class="summary-row"><span>Gift Wrapping</span><span>${formatPrice(totals.giftWrapFee)}</span></div>` : ''}
      <div class="summary-row"><span>Shipping</span><span>${totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}</span></div>
      <div class="summary-row"><span>GST (5%)</span><span>${formatPrice(totals.tax)}</span></div>
      <div class="summary-row total"><span>Total Payable</span><span>${formatPrice(totals.grandTotal)}</span></div>
    `;
  }
}

/**
 * Validates the current checkout step, stores its data on state.checkoutData
 * and advances the wizard. Step 4 is the final review step.
 */
function nextCheckoutStep() {
  const val = id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  if (state.checkoutStep === 1) {
    const email = val('chk-email');
    const phone = val('chk-phone').replace(/\s+/g, '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      showToast('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    state.checkoutData.email = email;
    state.checkoutData.phone = phone;

  } else if (state.checkoutStep === 2) {
    const name = val('chk-name');
    const house = val('chk-house');
    const street = val('chk-street');
    const city = val('chk-city');
    const pincode = val('chk-pincode');

    if (!name || !house || !street || !city) {
      showToast('Please complete all required address fields.');
      return;
    }
    if (!/^[1-9]\d{5}$/.test(pincode)) {
      showToast('Please enter a valid 6-digit PIN code.');
      return;
    }

    state.checkoutData.address = {
      name, house, street, city, pincode,
      state: val('chk-state'),
      landmark: val('chk-landmark')
    };
    state.checkoutData.giftNote = val('chk-gift-note');

    const saveBox = document.getElementById('chk-save-address');
    if (saveBox && saveBox.checked) {
      state.addresses = state.addresses.map(a => ({ ...a, isDefault: false }));
      state.addresses.push({
        id: 'addr-' + Date.now(),
        ...state.checkoutData.address,
        phone: state.checkoutData.phone || '',
        isDefault: true
      });
      saveState('addresses');
    }

  } else if (state.checkoutStep === 3) {
    const method = state.checkoutData.paymentMethod || 'card';
    if (method === 'card') {
      const number = val('chk-card-number').replace(/\s+/g, '');
      const expiry = val('chk-card-expiry');
      const cvv = val('chk-card-cvv');
      if (number.length < 12 || !/^\d+$/.test(number)) {
        showToast('Please enter a valid card number.');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        showToast('Please enter the card expiry as MM/YY.');
        return;
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        showToast('Please enter a valid CVV.');
        return;
      }
      state.checkoutData.cardLast4 = number.slice(-4);
    } else if (method === 'upi') {
      const upi = val('chk-upi-id');
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upi)) {
        showToast('Please enter a valid UPI ID (e.g. name@okbank).');
        return;
      }
      state.checkoutData.upiId = upi;
    } else if (method === 'netbanking') {
      state.checkoutData.bank = val('chk-bank');
    }
  }

  if (state.checkoutStep < 4) {
    state.checkoutStep += 1;
    renderCheckoutStep();
  }
}

// ==========================================================================
// 10. VIEW NAVIGATION (SPA-STYLE SECTION SWITCHING)
// ==========================================================================
function navigateTo(view) {
  const views = ['home', 'catalog', 'about', 'contact', 'account'];
  const target = views.includes(view) ? view : 'home';

  views.forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.style.display = (v === target) ? 'block' : 'none';
  });

  state.currentView = target;

  // Sync desktop nav underline state
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkView = link.getAttribute('data-view');
    link.classList.toggle('active', !!linkView && linkView === target);
  });

  // Render the destination view
  if (target === 'home') renderHomePage();
  if (target === 'catalog') renderCatalog();
  if (target === 'account') renderAccountWishlist();

  // Always close mobile chrome when navigating
  closeMobileNav();
  const sidebar = document.getElementById('filter-sidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// 11. FILTER CONTROLS
// ==========================================================================

// Keeps the sidebar radios/search/sort in sync with state.filters
function syncFilterControls() {
  const setRadio = (name, value) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
      input.checked = (input.value === String(value));
    });
  };

  setRadio('filter-category', state.filters.category);
  setRadio('filter-type', state.filters.type);
  setRadio('filter-price', state.filters.priceRange);
  setRadio('filter-rating', state.filters.minRating);
  setRadio('filter-language', state.filters.language);

  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) searchInput.value = state.filters.search;

  const sortSelect = document.getElementById('catalog-sort-select');
  if (sortSelect) sortSelect.value = state.filters.sort;

  // Subcategory group is driven by the currently selected category
  const group = document.getElementById('subcategory-filter-group');
  const options = document.getElementById('subcategory-filter-options');
  if (group && options) {
    const subs = CATEGORY_TREE[state.filters.category];
    if (subs) {
      group.hidden = false;
      options.innerHTML = [`
        <label class="filter-checkbox-label">
          <input type="radio" name="filter-subcategory" value="all" ${state.filters.subcategory === 'all' ? 'checked' : ''}
                 onchange="filterBySubcategory('${state.filters.category.replace(/'/g, "\\'")}', 'all')" />
          <span>All ${state.filters.category}</span>
        </label>
      `].concat(subs.map(sub => `
        <label class="filter-checkbox-label">
          <input type="radio" name="filter-subcategory" value="${sub}" ${state.filters.subcategory === sub ? 'checked' : ''}
                 onchange="filterBySubcategory('${state.filters.category.replace(/'/g, "\\'")}', '${sub.replace(/'/g, "\\'")}')" />
          <span>${sub}</span>
        </label>
      `)).join('');
    } else {
      group.hidden = true;
      options.innerHTML = '';
    }
  }
}

function filterByCategory(category) {
  state.filters.category = category || 'all';
  state.filters.subcategory = 'all';
  state.filters.author = 'all';

  navigateTo('catalog');
  syncFilterControls();
  renderCatalog();

  // navigateTo() marks every nav-link with data-view="catalog" as active,
  // which can't distinguish "Books" from "Stationery" since both share that
  // data-view. Correct it here using the more specific data-category match.
  document.querySelectorAll('.nav-link[data-view="catalog"]').forEach(link => {
    link.classList.toggle('active', link.dataset.category === state.filters.category);
  });

  const meta = CATEGORY_META[state.filters.category];
  if (meta) showToast(`${meta.icon} Browsing ${state.filters.category}`);
}

function filterBySubcategory(category, subcategory) {
  if (category) state.filters.category = category;
  state.filters.subcategory = subcategory || 'all';
  state.filters.author = 'all';

  navigateTo('catalog');
  syncFilterControls();
  renderCatalog();

  if (state.filters.subcategory !== 'all') {
    showToast(`Showing ${state.filters.subcategory}`);
  }
}

function filterByAuthor(authorName) {
  if (!authorName) return;

  // Author browsing starts from a clean slate so their full works are visible
  state.filters.author = authorName;
  state.filters.category = 'all';
  state.filters.subcategory = 'all';
  state.filters.search = '';

  navigateTo('catalog');
  syncFilterControls();
  renderCatalog();

  const profile = AUTHORS_DATA.find(a => a.name === authorName);
  showToast(profile ? `Exploring works by ${profile.name}` : `Showing books by ${authorName}`);
}

function resetAllFilters() {
  state.filters.search = '';
  state.filters.category = 'all';
  state.filters.subcategory = 'all';
  state.filters.author = 'all';
  state.filters.type = 'all';
  state.filters.priceRange = 'all';
  state.filters.minRating = 0;
  state.filters.language = 'all';
  state.filters.sort = 'featured';

  syncFilterControls();
  renderCatalog();
  showToast('All filters cleared.');
}

function clearSpecificFilter(key) {
  switch (key) {
    case 'search': state.filters.search = ''; break;
    case 'category':
      state.filters.category = 'all';
      state.filters.subcategory = 'all';
      break;
    case 'subcategory': state.filters.subcategory = 'all'; break;
    case 'author': state.filters.author = 'all'; break;
    case 'type': state.filters.type = 'all'; break;
    case 'priceRange': state.filters.priceRange = 'all'; break;
    case 'minRating': state.filters.minRating = 0; break;
    case 'language': state.filters.language = 'all'; break;
    default: return;
  }

  syncFilterControls();
  renderCatalog();
}

function toggleFilterSidebar() {
  const sidebar = document.getElementById('filter-sidebar');
  const toggle = document.getElementById('filter-drawer-toggle');
  if (!sidebar) return;

  const isOpen = sidebar.classList.toggle('mobile-open');
  if (toggle) toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if (isOpen) syncFilterControls();
}

// ==========================================================================
// 12. MOBILE NAVIGATION
// ==========================================================================
function closeMobileNav() {
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const toggle = document.getElementById('mobile-nav-toggle');

  if (drawer) drawer.classList.remove('active');
  if (backdrop) backdrop.hidden = true;
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('modal-open');
}

function openMobileNav() {
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const toggle = document.getElementById('mobile-nav-toggle');

  if (drawer) drawer.classList.add('active');
  if (backdrop) backdrop.hidden = false;
  if (toggle) toggle.setAttribute('aria-expanded', 'true');
  document.body.classList.add('modal-open');
}

// ==========================================================================
// 13. NAV COUNTERS (CART + WISHLIST BADGES)
// ==========================================================================
function updateNavCounters() {
  const cartCount = state.cart.reduce((n, item) => n + item.quantity, 0);
  const wishCount = state.wishlist.length;

  document.querySelectorAll('.cart-count-badge').forEach(el => {
    el.textContent = cartCount;
    el.style.display = cartCount > 0 ? 'flex' : 'none';
  });
  document.querySelectorAll('.wishlist-count-badge').forEach(el => {
    el.textContent = wishCount;
    el.style.display = wishCount > 0 ? 'flex' : 'none';
  });
  document.querySelectorAll('.wishlist-count-inline').forEach(el => {
    el.textContent = wishCount;
  });

  const mobileAccountText = document.getElementById('mobile-account-btn-text');
  if (mobileAccountText) {
    mobileAccountText.textContent = state.user ? `My Account (${state.user.name.split(' ')[0]})` : 'Sign In / My Account';
  }
}

// ==========================================================================
// 14. SIMULATED AUTHENTICATION (FRONTEND ONLY — NO REAL BACKEND)
// ==========================================================================
function openAuthModal(mode = 'login') {
  const overlay = document.getElementById('auth-modal');
  const content = document.getElementById('auth-modal-content');
  if (!overlay || !content) return;

  const isLogin = mode !== 'register';
  content.innerHTML = `
    <div class="auth-panel">
      <h2 class="auth-title">${isLogin ? 'Welcome Back to BookNook' : 'Join the BookNook Reader Club'}</h2>
      <p class="muted-note">Simulated sign-in for this demo &mdash; details are stored only in your browser.</p>

      <form id="auth-form" onsubmit="event.preventDefault(); submitAuth('${isLogin ? 'login' : 'register'}');">
        ${isLogin ? '' : `
          <div class="form-group">
            <label for="auth-name">Full Name *</label>
            <input type="text" id="auth-name" class="form-control" required placeholder="Ananya Sharma" autocomplete="name" />
          </div>
          <div class="form-group">
            <label for="auth-phone">Mobile Number *</label>
            <input type="tel" id="auth-phone" class="form-control" required inputmode="numeric" maxlength="10" placeholder="98765 43210" />
          </div>
        `}
        <div class="form-group">
          <label for="auth-email">Email Address *</label>
          <input type="email" id="auth-email" class="form-control" required placeholder="reader@example.com" autocomplete="email" />
        </div>
        <div class="form-group">
          <label for="auth-password">Password *</label>
          <input type="password" id="auth-password" class="form-control" required minlength="6" placeholder="At least 6 characters" autocomplete="${isLogin ? 'current-password' : 'new-password'}" />
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; margin-top:0.5rem;">
          ${isLogin ? 'Sign In' : 'Create My Account'}
        </button>
      </form>

      <p style="text-align:center; margin-top:1rem; font-size:0.88rem;">
        ${isLogin ? "New to BookNook?" : 'Already a member?'}
        <button type="button" class="btn btn-sm btn-ghost" style="text-decoration:underline;"
                onclick="openAuthModal('${isLogin ? 'register' : 'login'}')">
          ${isLogin ? 'Create an account' : 'Sign in instead'}
        </button>
      </p>
    </div>
  `;

  overlay.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeAuthModal() {
  const overlay = document.getElementById('auth-modal');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

function submitAuth(mode) {
  const val = id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  const email = val('auth-email');
  const password = val('auth-password');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.');
    return;
  }
  if (password.length < 6) {
    showToast('Password must be at least 6 characters.');
    return;
  }

  if (mode === 'register') {
    const name = val('auth-name');
    const phone = val('auth-phone').replace(/\s+/g, '');
    if (!name) {
      showToast('Please enter your full name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      showToast('Please enter a valid 10-digit mobile number.');
      return;
    }
    state.user = { name, email, phone, memberSince: new Date().toISOString() };
  } else {
    // Simulated login: reuse a stored profile if the email matches, else create one
    const existing = state.user && state.user.email === email ? state.user : null;
    state.user = existing || {
      name: email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      phone: '',
      memberSince: new Date().toISOString()
    };
  }

  saveState('user');
  closeAuthModal();
  updateNavCounters();
  navigateTo('account');
  renderAccountDashboard('overview');
  showToast(mode === 'register' ? `Welcome to BookNook, ${state.user.name}!` : `Signed in as ${state.user.name}`);
}

function logoutUser() {
  state.user = null;
  saveState('user');
  updateNavCounters();
  renderAccountDashboard('overview');
  showToast('You have been signed out. Your cart and wishlist are saved.');
}

function closeAuthorModal() {
  const overlay = document.getElementById('author-modal');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

            

function renderAccountDashboard(section = 'overview') {
  const container = document.getElementById('account-dashboard-view');
  if (!container) return;

  if (!state.user) {
    container.innerHTML = `
      <div class="container">
        <div class="empty-state" style="padding:5rem 0;">
          <div class="empty-state-icon">👤</div>
          <h3>Sign In to Your Account</h3>
          <p>Access your orders, saved addresses, wishlist and account details.</p>
          <button class="btn btn-primary" onclick="openAuthModal('login')">Sign In</button>
          <button class="btn btn-secondary" style="margin-left:0.75rem;" onclick="openAuthModal('register')">Create Account</button>
        </div>
      </div>`;
    return;
  }

  const u = state.user;
  const initials = u.name ? u.name.split(' ').map(function(w){ return w[0]; }).join('').slice(0,2).toUpperCase() : '?';
  const memberDate = u.memberSince
    ? new Date(u.memberSince).toLocaleDateString('en-IN', { year:'numeric', month:'long' })
    : 'Member';

  const menuItems = [
    { key:'overview',  icon:'🏠', label:'Overview' },
    { key:'orders',    icon:'📦', label:'My Orders' },
    { key:'addresses', icon:'📍', label:'Saved Addresses' },
    { key:'wishlist',  icon:'♥',  label:'Wishlist' }
  ];

  const navHTML = menuItems.map(function(m){
    return '<div class="account-menu-item ' + (section === m.key ? 'active' : '') + '" onclick="renderAccountDashboard(\'' + m.key + '\')">' +
      '<span>' + m.icon + '</span> ' + m.label + '</div>';
  }).join('');

  let contentHTML = '';

  if (section === 'overview') {
    contentHTML =
      '<h2 style="margin-bottom:0.25rem;">Welcome back, ' + u.name + '!</h2>' +
      '<p class="muted-note" style="margin-bottom:2rem;">Member since ' + memberDate + '</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1.25rem;">' +
        '<div class="account-nav-card" style="text-align:center;cursor:pointer;" onclick="renderAccountDashboard(\'orders\')">' +
          '<div style="font-size:2rem;">📦</div>' +
          '<div style="font-weight:700;font-size:1.4rem;margin:0.35rem 0;">' + state.orders.length + '</div>' +
          '<div class="muted-note">Orders</div></div>' +
        '<div class="account-nav-card" style="text-align:center;cursor:pointer;" onclick="renderAccountDashboard(\'wishlist\')">' +
          '<div style="font-size:2rem;">♥</div>' +
          '<div style="font-weight:700;font-size:1.4rem;margin:0.35rem 0;">' + state.wishlist.length + '</div>' +
          '<div class="muted-note">Wishlist Items</div></div>' +
        '<div class="account-nav-card" style="text-align:center;cursor:pointer;" onclick="renderAccountDashboard(\'addresses\')">' +
          '<div style="font-size:2rem;">📍</div>' +
          '<div style="font-weight:700;font-size:1.4rem;margin:0.35rem 0;">' + state.addresses.length + '</div>' +
          '<div class="muted-note">Saved Addresses</div></div>' +
      '</div>';

  } else if (section === 'orders') {
    if (state.orders.length === 0) {
      contentHTML =
        '<h2 style="margin-bottom:1.5rem;">My Orders</h2>' +
        '<div class="empty-state">' +
          '<div class="empty-state-icon">📦</div>' +
          '<h3>No Orders Yet</h3>' +
          '<p>Your order history will appear here after your first purchase.</p>' +
          '<button class="btn btn-primary" onclick="navigateTo(\'catalog\')">Start Shopping</button>' +
        '</div>';
    } else {
      var payLabels = { card:'Credit / Debit Card', upi:'UPI', netbanking:'Net Banking', cod:'Cash on Delivery' };
      var TIMELINE = [
        { key:'Confirmed',         icon:'✅', label:'Confirmed' },
        { key:'Processing',        icon:'🔄', label:'Processing' },
        { key:'Dispatched',        icon:'📬', label:'Dispatched' },
        { key:'Out for Delivery',  icon:'🚚', label:'Out for Delivery' },
        { key:'Delivered',         icon:'🏠', label:'Delivered' }
      ];
      var orderCards = state.orders.slice().reverse().map(function(o) {
        var date = o.date ? new Date(o.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';
        var total = o.total != null ? formatPrice(o.total) : '—';
        var status = o.status || 'Confirmed';
        var eta = o.estimatedDelivery || '—';
        var payLabel = payLabels[o.paymentMethod] || o.paymentMethod || 'Card';
        var statusIdx = Math.max(0, TIMELINE.findIndex(function(s){ return s.key === status; }));
        var timelineHTML = TIMELINE.map(function(step, idx) {
          var done   = idx < statusIdx;
          var active = idx === statusIdx;
          var col    = (done || active) ? 'var(--primary-forest)' : 'var(--cream-border)';
          var tcol   = (done || active) ? 'var(--primary-forest)' : 'var(--text-muted)';
          var badge  = done ? '✓' : (active ? step.icon : String(idx + 1));
          var line   = idx < TIMELINE.length - 1
            ? '<div style="position:absolute;top:14px;left:50%;width:100%;height:2px;background:' + (done ? 'var(--primary-forest)' : 'var(--cream-border)') + ';z-index:0;"></div>'
            : '';
          return '<div style="display:flex;flex-direction:column;align-items:center;flex:1;position:relative;">' +
            line +
            '<div style="width:28px;height:28px;border-radius:50%;background:' + col + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;position:relative;z-index:1;border:2px solid ' + col + ';">' + badge + '</div>' +
            '<div style="font-size:0.72rem;font-weight:' + (active ? '700' : '500') + ';color:' + tcol + ';text-align:center;margin-top:0.35rem;line-height:1.2;">' + step.label + '</div>' +
            '</div>';
        }).join('');
        var itemsList = (o.items || []).map(function(item){
          return '<div style="display:flex;justify-content:space-between;font-size:0.85rem;padding:0.3rem 0;border-bottom:1px solid var(--cream-border);">' +
            '<span>' + (item.title || item.id) + (item.quantity > 1 ? ' ×' + item.quantity : '') + '</span>' +
            '<span style="font-weight:600;">' + formatPrice(item.price * item.quantity) + '</span></div>';
        }).join('');
        return '<div style="border:1px solid var(--cream-border);border-radius:var(--radius-md);padding:1.5rem;margin-bottom:1.5rem;">' +
          '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.25rem;">' +
            '<div><div style="font-weight:700;">' + o.id + '</div>' +
            '<div class="muted-note" style="font-size:0.83rem;">' + date + ' · ' + (o.items||[]).length + ' item(s)</div></div>' +
            '<div style="text-align:right;"><div style="font-weight:700;color:var(--primary-forest);">' + total + '</div>' +
            '<div style="font-size:0.8rem;font-weight:600;color:var(--accent-gold);">' + status + '</div></div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.25rem;padding:1rem;background:var(--cream-bg);border-radius:var(--radius-sm);margin-bottom:1rem;">' + timelineHTML + '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:1.5rem;margin-bottom:1rem;font-size:0.85rem;">' +
            '<div><span class="muted-note">Est. Arrival:</span> <strong>' + eta + '</strong></div>' +
            '<div><span class="muted-note">Payment:</span> ' + payLabel + '</div>' +
          '</div>' +
          (itemsList ? '<div>' + itemsList + '</div>' : '') +
          '<p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.75rem;">ℹ️ Tracking is simulated. No real courier service is connected.</p>' +
        '</div>';
      }).join('');
      contentHTML = '<h2 style="margin-bottom:1.5rem;">My Orders (' + state.orders.length + ')</h2>' + orderCards;
    }

  } else if (section === 'addresses') {
    if (state.addresses.length === 0) {
      contentHTML =
        '<h2 style="margin-bottom:1.5rem;">Saved Addresses</h2>' +
        '<div class="empty-state"><div class="empty-state-icon">📍</div>' +
        '<h3>No Saved Addresses</h3><p>Addresses saved during checkout will appear here.</p></div>';
    } else {
      var addrCards = state.addresses.map(function(a){
        return '<div style="border:1px solid var(--cream-border);border-radius:var(--radius-md);padding:1.25rem;margin-bottom:1rem;position:relative;">' +
          (a.isDefault ? '<span style="position:absolute;top:0.75rem;right:1rem;font-size:0.78rem;font-weight:700;color:var(--primary-forest);background:var(--primary-fade);padding:2px 8px;border-radius:99px;">Default</span>' : '') +
          '<div style="font-weight:700;">' + (a.name || u.name) + '</div>' +
          (a.street ? '<div class="muted-note" style="font-size:0.88rem;margin-top:0.25rem;">' + a.street + '</div>' : '') +
          (a.landmark ? '<div class="muted-note" style="font-size:0.85rem;">' + a.landmark + '</div>' : '') +
          '<div class="muted-note" style="font-size:0.85rem;">' + [a.city, a.state, a.zip].filter(Boolean).join(', ') + '</div>' +
          (a.phone ? '<div class="muted-note" style="font-size:0.85rem;">' + a.phone + '</div>' : '') +
        '</div>';
      }).join('');
      contentHTML = '<h2 style="margin-bottom:1.5rem;">Saved Addresses</h2>' + addrCards;
    }

  } else if (section === 'wishlist') {
    var wishlistProducts = state.products.filter(function(p){ return state.wishlist.includes(p.id); });
    if (wishlistProducts.length === 0) {
      contentHTML =
        '<h2 style="margin-bottom:1.5rem;">Wishlist</h2>' +
        '<div class="empty-state"><div class="empty-state-icon">♥</div>' +
        '<h3>Your Wishlist is Empty</h3><p>Save your favourite books and stationery for later.</p>' +
        '<button class="btn btn-primary" onclick="navigateTo(\'catalog\')">Explore Catalog</button></div>';
    } else {
      contentHTML =
        '<h2 style="margin-bottom:1.5rem;">Wishlist (' + wishlistProducts.length + ')</h2>' +
        '<div id="account-wishlist-grid" class="product-grid">' + wishlistProducts.map(renderProductCard).join('') + '</div>';
    }
  }

  container.innerHTML =
    '<div class="container"><div class="account-layout">' +
      '<aside class="account-nav-card">' +
        '<div class="user-profile-badge">' +
          '<div class="user-avatar-lg">' + initials + '</div>' +
          '<div style="font-weight:700;">' + u.name + '</div>' +
          '<div class="muted-note" style="font-size:0.82rem;">' + u.email + '</div>' +
        '</div>' +
        navHTML +
        '<div class="account-menu-item" style="color:var(--error,#c0392b);margin-top:1rem;" onclick="logoutUser()">' +
          '<span>🚪</span> Sign Out</div>' +
      '</aside>' +
      '<div class="account-content-card">' + contentHTML + '</div>' +
    '</div></div>';
}

function placeOrder() {
  if (state.cart.length === 0) {
    showToast('Your cart is empty. Add items before placing an order.');
    return;
  }

  const cd = state.checkoutData;
  if (!cd.email || !cd.phone) {
    showToast('Please complete your contact information before placing the order.');
    return;
  }
  if (!cd.address || !cd.address.city) {
    showToast('Please complete your shipping address before placing the order.');
    return;
  }

  const totals = calculateCartTotals();
  const payLabels = { card: 'Credit / Debit Card', upi: 'UPI', netbanking: 'Net Banking', cod: 'Cash on Delivery' };
  const orderId = 'BN-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
  const isExpress = cd.shippingMethod === 'express';
  const deliveryDays = isExpress ? 2 : 6;
  const estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const order = {
    id: orderId,
    date: new Date().toISOString(),
    items: state.cart.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    giftWrapFee: totals.giftWrapFee,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.grandTotal,
    address: Object.assign({}, cd.address),
    email: cd.email,
    phone: cd.phone,
    paymentMethod: cd.paymentMethod || 'card',
    shippingMethod: cd.shippingMethod || 'standard',
    giftNote: cd.giftNote || '',
    status: 'Confirmed',
    estimatedDelivery: estimatedDelivery
  };

  state.orders.push(order);
  saveState('orders');

  clearCart();

  state.checkoutStep = 1;
  state.checkoutData = { shippingMethod: 'standard', paymentMethod: 'card', giftWrap: false, giftNote: '', address: {} };

  const body = document.getElementById('checkout-body');
  const summaryBox = document.getElementById('checkout-summary-container');
  if (summaryBox) summaryBox.innerHTML = '';

  if (body) {
    const payLabel = payLabels[order.paymentMethod] || order.paymentMethod;
    const deliveryLabel = isExpress ? 'Express (1–2 days)' : 'Standard (4–6 days)';
    body.innerHTML =
      '<div style="text-align:center;padding:2.5rem 1rem;">' +
        '<div style="font-size:3.5rem;margin-bottom:1rem;">🎉</div>' +
        '<h2 style="color:var(--primary-forest);margin-bottom:0.5rem;">Order Placed Successfully!</h2>' +
        '<p style="color:var(--text-muted);margin-bottom:2rem;">Thank you for shopping with BookNook.</p>' +
        '<div style="background:var(--cream-bg);border:1px solid var(--cream-border);border-radius:var(--radius-md);padding:1.5rem;text-align:left;max-width:420px;margin:0 auto 2rem auto;">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:0.6rem;"><span style="color:var(--text-muted);font-size:0.88rem;">Order ID</span><span style="font-weight:700;font-size:0.9rem;">' + orderId + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:0.6rem;"><span style="color:var(--text-muted);font-size:0.88rem;">Total Paid</span><span style="font-weight:700;color:var(--primary-forest);">' + formatPrice(totals.grandTotal) + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:0.6rem;"><span style="color:var(--text-muted);font-size:0.88rem;">Payment</span><span style="font-size:0.9rem;">' + payLabel + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:0.6rem;"><span style="color:var(--text-muted);font-size:0.88rem;">Delivery</span><span style="font-size:0.9rem;">' + deliveryLabel + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:0.6rem;"><span style="color:var(--text-muted);font-size:0.88rem;">Est. Arrival</span><span style="font-size:0.9rem;font-weight:600;">' + estimatedDelivery + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-muted);font-size:0.88rem;">Status</span><span style="font-size:0.9rem;font-weight:700;color:var(--accent-gold);">Confirmed ✓</span></div>' +
        '</div>' +
        '<p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:1.5rem;">This is a simulated order for demo purposes. No real payment has been processed.</p>' +
        '<div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">' +
          '<button class="btn btn-primary" onclick="closeCheckoutModal();navigateTo(\'account\');renderAccountDashboard(\'orders\');">View My Orders</button>' +
          '<button class="btn btn-outline" onclick="closeCheckoutModal();navigateTo(\'catalog\');">Continue Shopping</button>' +
        '</div>' +
      '</div>';
  }

  showToast('Order ' + orderId + ' confirmed! Est. delivery: ' + estimatedDelivery);
}

// ==========================================================================
// APPLICATION BOOTSTRAP
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
  // 1. Restore persisted state
  loadPersistedState();

  // 2. Render default home view
  navigateTo('home');
  renderHomePage();

  // 3. Update counters and sync filter UI to restored state
  updateNavCounters();
  syncFilterControls();

  // 4. Search input — no inline handler
  var searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.filters.search = this.value.trim();
      renderCatalog();
    });
  }

  // 5. Sort select — no inline handler
  var sortSelect = document.getElementById('catalog-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      state.filters.sort = this.value;
      renderCatalog();
    });
  }

  // 6. Filter radio groups — no inline onchange on these inputs
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || t.type !== 'radio') return;
    if (t.name === 'filter-category') {
      filterByCategory(t.value === 'all' ? null : t.value);
    } else if (t.name === 'filter-type') {
      state.filters.type = t.value;
      renderCatalog();
    } else if (t.name === 'filter-price') {
      state.filters.priceRange = t.value;
      renderCatalog();
    } else if (t.name === 'filter-rating') {
      state.filters.minRating = parseFloat(t.value) || 0;
      renderCatalog();
    } else if (t.name === 'filter-language') {
      state.filters.language = t.value;
      renderCatalog();
    }
    // filter-subcategory radios use inline onchange set by syncFilterControls()
  });

  // 7. Mobile nav toggle — no inline handler on this button
  var mobileNavToggle = document.getElementById('mobile-nav-toggle');
  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', openMobileNav);
  }
  // mobile-nav-backdrop already has inline onclick="closeMobileNav()"
  // filter-drawer-toggle already has inline onclick="toggleFilterSidebar()"
  // All auth/cart/wishlist/checkout/modal buttons use inline onclick handlers

  // 8. Contact form — no inline handler
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameVal = (document.getElementById('cnt-name') || {}).value || '';
      var emailVal = (document.getElementById('cnt-email') || {}).value || '';
      var messageVal = (document.getElementById('cnt-message') || {}).value || '';
      nameVal = nameVal.trim();
      emailVal = emailVal.trim();
      messageVal = messageVal.trim();

      if (!nameVal) {
        showToast('Please enter your full name.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showToast('Please enter a valid email address.');
        return;
      }
      if (!messageVal) {
        showToast('Please enter a message for our curators.');
        return;
      }

      showToast('Thank you! Your message has been sent to our curators.');
      contactForm.reset();
    });
  }

  // 9. Newsletter form — no inline handler
  var newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var newsletterEmail = (document.getElementById('newsletter-email') || {}).value || '';
      newsletterEmail = newsletterEmail.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
        showToast('Please enter a valid email address.');
        return;
      }

      showToast("You're subscribed successfully!");
      newsletterForm.reset();
    });
  }

  // 10. Pre-populate catalog grid
  renderCatalog();
});