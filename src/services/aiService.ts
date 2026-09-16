import { GoogleGenAI } from '@google/generative-ai';
import { dbService, Product } from './dbService';

// Initialize Gemini API client if key is set
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const aiService = {
  // 1. AI RECOMMENDATION ENGINE (Rule-based, structure for ML transition)
  getRecommendations: (productId: string, type: 'also-like' | 'complete-look' | 'style-based'): Product[] => {
    const products = dbService.getProducts().filter(p => p.status === 'active');
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return products.slice(0, 4);

    if (type === 'also-like') {
      // Recommend products in the same category, excluding itself
      return products
        .filter(p => p.categoryId === targetProduct.categoryId && p.id !== targetProduct.id)
        .slice(0, 4);
    }

    if (type === 'complete-look') {
      // Complementary products. If clothing, recommend accessories/shoes. Match by tags or categories.
      if (targetProduct.categoryId === 'women' || targetProduct.categoryId === 'men') {
        // Recommend accessories
        return products.filter(p => p.categoryId === 'accessories').slice(0, 4);
      } else {
        // Recommend apparel matching any mutual tags
        return products
          .filter(p => p.categoryId !== 'accessories' && p.tags.some(t => targetProduct.tags.includes(t)))
          .slice(0, 4);
      }
    }

    if (type === 'style-based') {
      // Based on brand or mutual tags
      return products
        .filter(p => p.id !== targetProduct.id && (p.brandId === targetProduct.brandId || p.tags.some(t => targetProduct.tags.includes(t))))
        .slice(0, 4);
    }

    return products.slice(0, 4);
  },

  // 2. AI FASHION ASSISTANT CHAT ROUTER
  chatAssistant: async (message: string, chatHistory: { role: 'user' | 'model'; text: string }[] = []) => {
    const products = dbService.getProducts().filter(p => p.status === 'active');
    const categories = dbService.getCategories();
    
    // Check if Gemini is configured
    const ai = getGeminiClient();
    if (ai) {
      try {
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Construct detailed prompt injecting store catalog
        const catalogInfo = products.map(p => ({
          id: p.id,
          name: p.name,
          price: `₹${p.price}`,
          category: p.categoryId,
          description: p.shortDescription,
          tags: p.tags,
          link: `/product/${p.id}`
        }));

        const systemInstruction = `You are a premium AI fashion consultant named "Nova". You work for an ultra-high-end editorial fashion e-commerce brand.
Your tone is sophisticated, elegant, polite, and minimal.
Use the following product catalog to recommend REAL products from the store. Do not invent products that do not exist in the catalog.
Store Catalog:
${JSON.stringify(catalogInfo, null, 2)}

Guidelines:
1. Always suggest products from the catalog if they match the user's need.
2. Provide direct product links using the exact format: [Product Name](/product/Product-ID)
3. For wedding queries, recommend formal wear like coats, silk blazers, and slip dresses.
4. For budget queries, respect the maximum price mentioned (e.g. under ₹3000 or ₹8000).
5. If no items match, politely offer the closest alternative from our catalog.
6. Keep answers short, editorial, and styled. Write short paragraphs.`;

        // Format history for Gemini API
        const contents = [
          { role: 'user', parts: [{ text: systemInstruction }] },
          ...chatHistory.map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.text }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ];

        const result = await model.generateContent({ contents });
        const responseText = result.response.text();
        return {
          response: responseText,
          recommendedProductIds: products
            .filter(p => responseText.toLowerCase().includes(p.name.toLowerCase()) || responseText.toLowerCase().includes(p.id.toLowerCase()))
            .map(p => p.id)
        };
      } catch (err) {
        console.error('Gemini API call failed, falling back to local processor:', err);
      }
    }

    // LOCAL INTELLECTUAL RULE-BASED FALLBACK
    const query = message.toLowerCase();
    let reply = "";
    let matchedProducts: Product[] = [];

    // Simple keyword extraction
    if (query.includes('wedding') || query.includes('marriage') || query.includes('reception') || query.includes('formal')) {
      matchedProducts = products.filter(p => p.tags.includes('wedding') || p.tags.includes('formal'));
      reply = "For weddings or formal affairs, we recommend focusing on clean silhouettes and rich materials. A tailored blazer or cashmere coat serves as the perfect styling anchor.";
    } else if (query.includes('summer') || query.includes('hot') || query.includes('casual')) {
      matchedProducts = products.filter(p => p.tags.includes('summer') || p.tags.includes('casual') || p.categoryId === 'accessories');
      reply = "For effortless casual styling, light materials and versatile accessories are key. We recommend pairing a raw denim jacket with relaxed trousers or a minimalist backpack.";
    } else if (query.includes('black') || query.includes('dark')) {
      matchedProducts = products.filter(p => 
        p.name.toLowerCase().includes('black') || 
        p.description.toLowerCase().includes('black') ||
        p.variants.some(v => v.color.toLowerCase() === 'black')
      );
      reply = "A monochrome charcoal or black palette offers timeless sophistication. Here are the premium black silhouettes from our collections.";
    } else if (query.includes('jean') || query.includes('denim') || query.includes('pants') || query.includes('trouser')) {
      matchedProducts = products.filter(p => p.tags.includes('denim') || p.tags.includes('trouser'));
      reply = "Our denim and trousers are cut from select Italian and Japanese mills. They pair perfectly with structured boots and lightweight knitwear.";
    }

    // Price filters
    const priceMatch = query.match(/(?:under|below|less than)\s*₹?\s*(\d+)/) || query.match(/₹?\s*(\d+)\s*(?:budget|limit)/);
    if (priceMatch && priceMatch[1]) {
      const budget = parseInt(priceMatch[1]);
      const underBudget = products.filter(p => p.price <= budget);
      if (underBudget.length > 0) {
        matchedProducts = underBudget;
        reply = `Here are our finest selections curated for a budget under ₹${budget}. Each piece retains our hallmark commitment to premium construction.`;
      } else {
        matchedProducts = products.sort((a,b) => a.price - b.price).slice(0, 3);
        reply = `We do not have items directly below ₹${budget}, but here are our most accessible essentials that represent long-term wardrobe value.`;
      }
    }

    // Default reply if no keyword matched
    if (matchedProducts.length === 0) {
      matchedProducts = products.slice(0, 3);
      reply = "Welcome to NOVA. We offer contemporary fashion designed for modern silhouettes. Tell me what event or look you are preparing for, and I will recommend specific pieces from our catalog.";
    }

    // Build editorial links
    const recommendationLinks = matchedProducts
      .map(p => `• [${p.name}](/product/${p.id}) — ₹${p.price}`)
      .join('\n');

    return {
      response: `${reply}\n\nRecommended for you:\n${recommendationLinks}`,
      recommendedProductIds: matchedProducts.map(p => p.id)
    };
  },

  // 3. AI PRODUCT CONTENT GENERATOR
  generateProductContent: async (data: { category: string; brand: string; color: string; keywords: string }) => {
    const ai = getGeminiClient();
    
    if (ai) {
      try {
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Write high-end editorial product copywriting for a luxury fashion item.
Category: ${data.category}
Brand: ${data.brand}
Primary Color: ${data.color}
Key Details/Keywords: ${data.keywords}

Please generate the following structured JSON output:
{
  "title": "A short, elegant product title",
  "shortDescription": "A concise, punchy 1-line description of the piece's style",
  "description": "A detailed, luxury marketing description (2-3 paragraphs) highlighting fit, craftsmanship, premium materials, styling possibilities",
  "seoTitle": "SEO optimized search title under 60 chars",
  "seoDescription": "SEO meta description under 150 chars",
  "tags": ["array", "of", "4-6", "tags", "in", "lowercase"]
}`;
        const result = await model.generateContent({ prompt });
        const text = result.response.text();
        // Extract JSON block
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.error('Gemini content generation failed, falling back:', err);
      }
    }

    // LOCAL RULE-BASED CONTENT GENERATOR (FALLBACK)
    const brand = data.brand || 'NOVA';
    const color = data.color || 'Camel';
    const category = data.category || 'Outerwear';
    const keywords = data.keywords || 'premium wool, oversize, winter';

    const title = `Tailored ${color} ${category}`;
    const shortDescription = `An elegant, structured ${category.toLowerCase()} crafted from select materials.`;
    const description = `Designed by ${brand}, this premium ${category.toLowerCase()} is cut in a modern silhouette featuring fine detailing. Featuring a structured shoulder line, deep welt pockets, and a soft cupro lining for comfortable layered wear. Perfect for transitioning between seasons, it pairs effortlessly with structured trousers or casual denim. Made with meticulous craftsmanship, it represents a long-term investment in style.`;
    const seoTitle = `${title} | Buy ${brand} Luxury Fashion Online`;
    const seoDescription = `Shop the ${title} from ${brand}. Crafted with premium fabric in a modern luxury cut. Fast delivery and free returns.`;
    const tags = [category.toLowerCase(), color.toLowerCase(), 'luxury', 'essential', ...keywords.split(',').map(k => k.trim().toLowerCase())].slice(0, 6);

    return {
      title,
      shortDescription,
      description,
      seoTitle,
      seoDescription,
      tags
    };
  }
};
