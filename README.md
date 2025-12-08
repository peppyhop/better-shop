# Better Shop

A pluggable, type-safe shop service built with [better-call](https://github.com/better-auth/better-call) and [shop-client](https://github.com/peppyhop/shop-client). It provides a full-featured RPC API for interacting with Shopify stores, including product fetching, collection management, checkout URL generation, and LLM-powered enrichment.

## Features

-   **Type-Safe RPC**: End-to-end type safety with `better-call` and `arktype`.
-   **Full Shopify Integration**: Covers products, collections, store info, and checkout.
-   **Caching**: Built-in caching for store info and other resources.
-   **Pluggable**: Easy to mount into any existing `better-call` router or server (Bun, Node, etc.).
-   **LLM Ready**: Includes endpoints for product classification, SEO generation, and enrichment.

## Installation

```bash
npm install better-shop better-call shop-client arktype
# or
bun add better-shop better-call shop-client arktype
```

## Usage

### Server

Create a shop router and serve it (e.g., using Bun). The router expects an `x-shop-domain` header in every request to identify the target store.

```typescript
import { betterShop } from "better-shop";

const router = betterShop({
    cacheTTL: 60_000 // Optional: Cache TTL in ms
});

Bun.serve({
    fetch: router.handler
});
```

### Client

Use the `better-call` client for type-safe interaction. Ensure you pass the `x-shop-domain` header.

```typescript
import { createClient } from "better-call/client";
import type { betterShop } from "better-shop";

// Create a type alias for the router return type
type ShopRouter = ReturnType<typeof betterShop>;

const client = createClient<ShopRouter>({
    baseURL: "http://localhost:3000",
    headers: {
        "x-shop-domain": "your-shop.myshopify.com"
    }
});

// Fetch products
const products = await client("/products/paginated", {
    query: { page: 1, limit: 10 }
});

if (products.data) {
    console.log(products.data);
}
```

## Composable Endpoints

You can compose only the endpoints you need using named exports. This is useful when you want a smaller router or custom OpenAPI settings.

### Named Exports
- `makeGetShop` – creates a `getShop(headers)` function using `ShopClient`
- `buildStoreEndpoints` – returns `{ getInfo, clearInfoCache, determineStoreType }`
- `buildProductEndpoints` – returns product endpoints like `{ getAllProducts, getPaginatedProducts, getShowcasedProducts, getProductFilters, getProduct, getEnrichedProduct, classifyProduct, generateProductSEO }`
- `buildCollectionEndpoints` – returns collection endpoints like `{ getAllCollections, getPaginatedCollections, getShowcasedCollections, getCollection, getCollectionProductsAll, getCollectionProductsPaginated, getCollectionProductSlugs }`
- `buildCheckoutEndpoints` – returns `{ createCheckoutUrl }`
- `betterShop` – the full ready-made router

### Compose Your Own Router

```typescript
import { createRouter } from "better-call";
import {
  makeGetShop,
  buildStoreEndpoints,
  buildProductEndpoints,
} from "better-shop";

const getShop = makeGetShop({ /* optional ShopClientOptions */ });
const { getInfo } = buildStoreEndpoints(getShop);
const { getShowcasedProducts } = buildProductEndpoints(getShop);

export const myShop = createRouter(
  { getInfo, getShowcasedProducts },
  { openapi: { disabled: false, path: "/api/reference" } },
);
```

### Use the Full Router

```typescript
import { betterShop } from "better-shop";
export const router = betterShop({ /* optional ShopClientOptions */ });
```

### Subpath Exports
Import individual modules via subpath exports for maximum control and tree-shaking.

```typescript
import { makeGetShop } from "better-shop/shop/getShop";
import { buildProductEndpoints } from "better-shop/shop/products";
import { buildStoreEndpoints } from "better-shop/shop/store";
import { buildCollectionEndpoints } from "better-shop/shop/collections";
import { buildCheckoutEndpoints } from "better-shop/shop/checkout";
```

```json
{
  "imports": {
    "better-shop/shop/products": "node_modules/better-shop/dist/shop/products.js"
  }
}
```

These subpaths are declared in `package.json` `exports` and point to the built ESM/CJS/DTS files under `dist/shop/*`.

### OpenAPI Docs
- OpenAPI docs are served at `GET /api/reference` with a Scalar UI.
- Each endpoint includes `responses` with `description: "OK"` for 200 responses to satisfy `better-call` OpenAPI typing.

## API Reference

### Store Operations

-   `GET /info`: Get store metadata (name, domain, currency, etc.).
-   `POST /info/clear-cache`: Clear the store info cache.
-   `POST /store-type`: Determine store vertical and audience using LLM.

### Product Operations

-   `GET /products/all`: Fetch all products.
-   `GET /products/paginated`: Fetch products with pagination (`page`, `limit`).
-   `GET /products/showcased`: Get products featured on the homepage.
-   `GET /products/filters`: Get product filters (options).
-   `GET /products/:handle`: Get a single product by handle.
-   `POST /products/:handle/enriched`: Enrich product data (markdown/HTML) using LLM.
-   `POST /products/:handle/classify`: Classify product audience/vertical.
-   `POST /products/:handle/seo`: Generate SEO content.

### Collection Operations

-   `GET /collections/all`: Fetch all collections.
-   `GET /collections/paginated`: Fetch collections with pagination.
-   `GET /collections/showcased`: Get showcased collections.
-   `GET /collections/:handle`: Get a collection by handle.
-   `GET /collections/:handle/products/paginated`: Get products in a collection.

### Checkout Operations

-   `POST /checkout/url`: Generate a pre-filled checkout URL.

### Examples

```bash
# Get store info
curl -H "x-shop-domain: your-shop.myshopify.com" \
  http://localhost:3000/info

# Get paginated products
curl -H "x-shop-domain: your-shop.myshopify.com" \
  "http://localhost:3000/products/paginated?page=1&limit=10"

# Generate checkout URL
curl -X POST \
  -H "x-shop-domain: your-shop.myshopify.com" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "items": [{ "productVariantId": "gid://shopify/ProductVariant/123", "quantity": "1" }],
    "address": {
      "firstName": "John",
      "lastName": "Doe",
      "address1": "123 St",
      "city": "City",
      "zip": "12345",
      "country": "US",
      "province": "CA",
      "phone": "1234567890"
    }
  }' \
  http://localhost:3000/checkout/url
```

```typescript
import { createClient } from "better-call/client";
import type { betterShop } from "better-shop";

type ShopRouter = ReturnType<typeof betterShop>;

const client = createClient<ShopRouter>({
  baseURL: "http://localhost:3000",
  headers: { "x-shop-domain": "your-shop.myshopify.com" }
});

const info = await client("/info");
const products = await client("/products/paginated", { query: { page: 1, limit: 10 } });
```

### Endpoint Examples

```typescript
type CurrencyCode = NonNullable<Intl.NumberFormatOptions["currency"]>;

type LocalizedPricing = {
  currency: string;
  priceFormatted: string;
  priceMinFormatted: string;
  priceMaxFormatted: string;
  compareAtPriceFormatted: string;
};

type ProductOption = {
  key: string;
  data: string[];
  name: string;
  position: number;
  values: string[];
};

type ProductVariantImage = {
  width: number;
  height: number;
  aspect_ratio?: number;
  id: number;
  src: string;
  position: number;
  productId: number;
  aspectRatio: number;
  variantIds: unknown[];
  createdAt: string;
  updatedAt: string;
  alt: string | null;
};

type ProductVariant = {
  id: string;
  platformId: string;
  name?: string;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  options?: string[];
  sku: string | null;
  requiresShipping: boolean;
  taxable: boolean;
  featuredImage: ProductVariantImage | null;
  available: boolean;
  price: number;
  weightInGrams?: number;
  compareAtPrice: number;
  position: number;
  productId: number;
  createdAt?: string;
  updatedAt?: string;
};

type ProductImage = {
  width: number;
  height: number;
  aspect_ratio?: number;
  id: number;
  productId: number;
  alt: string | null;
  position: number;
  src: string;
  mediaType: "image" | "video";
  variantIds: unknown[];
  createdAt?: string;
  updatedAt?: string;
};

type MetaTag =
  | { name: string; content: string }
  | { property: string; content: string }
  | { itemprop: string; content: string };

type Product = {
  slug: string;
  handle: string;
  platformId: string;
  title: string;
  available: boolean;
  price: number;
  priceMin: number;
  priceVaries: boolean;
  compareAtPrice: number;
  compareAtPriceMin: number;
  priceMax: number;
  compareAtPriceMax: number;
  compareAtPriceVaries: boolean;
  discount: number;
  currency?: string;
  localizedPricing?: LocalizedPricing;
  options: ProductOption[];
  bodyHtml: string | null;
  active?: boolean;
  productType: string | null;
  tags: string[];
  vendor: string;
  featuredImage?: string | null;
  isProxyFeaturedImage: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
  variants: ProductVariant[] | null;
  images: ProductImage[];
  publishedAt: Date | null;
  seo?: MetaTag[] | null;
  metaTags?: MetaTag[] | null;
  displayScore?: number;
  deletedAt?: Date | null;
  storeSlug: string;
  storeDomain: string;
  embedding?: number[] | null;
  url: string;
  requiresSellingPlan?: boolean | null;
  sellingPlanGroups?: unknown;
  variantOptionsMap: Record<string, string>;
  enriched_content?: string;
};

type Collection = {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: {
    id: number;
    createdAt: string;
    src: string;
    alt?: string;
  };
  productsCount: number;
  publishedAt: string;
  updatedAt: string;
};

type JsonLdEntry = Record<string, unknown>;

type CountryDetectionResult = {
  country: string;
  confidence: number;
  signals: string[];
  currencyCode?: string;
};

interface StoreInfo {
  name: string;
  domain: string;
  slug: string;
  title: string | null;
  description: string | null;
  logoUrl: string | null;
  socialLinks: Record<string, string>;
  contactLinks: {
    tel: string | null;
    email: string | null;
    contactPage: string | null;
  };
  headerLinks: string[];
  showcase: {
    products: string[];
    collections: string[];
  };
  jsonLdData: JsonLdEntry[] | undefined;
  techProvider: {
    name: string;
    walletId: string | undefined;
    subDomain: string | null;
  };
  country: CountryDetectionResult["country"];
}

type ProductClassification = {
  audience: "adult_male" | "adult_female" | "kid_male" | "kid_female" | "generic";
  vertical: "clothing" | "beauty" | "accessories" | "home-decor" | "food-and-beverages";
  category?: string | null;
  subCategory?: string | null;
};

type SEOContent = {
  metaTitle: string;
  metaDescription: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  marketingCopy: string;
};

type StoreTypeBreakdown = Partial<
  Record<
    "adult_male" | "adult_female" | "kid_male" | "kid_female" | "generic",
    Partial<Record<"clothing" | "beauty" | "accessories" | "home-decor" | "food-and-beverages", string[]>>
  >
>;

type Filters = Record<string, string[]>;
type CheckoutUrl = { url: string };
```

#### GET `/info`
- Returns store metadata.

```bash
curl -H "x-shop-domain: your-shop.myshopify.com" \
  http://localhost:3000/info
```

```typescript
const res = await client("/info");
const info = res.data as StoreInfo;
```

#### POST `/info/clear-cache`
- Clears cached store info.

```bash
curl -X POST -H "x-shop-domain: your-shop.myshopify.com" \
  http://localhost:3000/info/clear-cache
```

```typescript
const cleared = await client("/info/clear-cache");
// { success: true }
```

#### POST `/store-type`
- Determines store vertical/audience.

```bash
curl -X POST -H "x-shop-domain: your-shop.myshopify.com" \
  -H "Content-Type: application/json" \
  -d '{ "model": "gpt-4o-mini" }' \
  http://localhost:3000/store-type
```

```typescript
const res = await client("/store-type", { body: { model: "gpt-4o-mini" } });
const storeType = res.data as StoreTypeBreakdown;
```

#### GET `/products/all`
- Returns all products.

```bash
curl -H "x-shop-domain: your-shop.myshopify.com" \
  "http://localhost:3000/products/all?currency=USD"
```

```typescript
const res = await client("/products/all", { query: { currency: "USD" } });
const products = res.data as Product[];
```

#### GET `/products/paginated`
- Returns products with pagination.

```bash
curl -H "x-shop-domain: your-shop.myshopify.com" \
  "http://localhost:3000/products/paginated?page=2&limit=10&currency=USD"
```

```typescript
const res = await client("/products/paginated", {
  query: { page: 2, limit: 10, currency: "USD" }
});
const products = res.data as Product[];
```

#### GET `/products/showcased`
- Returns featured products.

```bash
curl -H "x-shop-domain: your-shop.myshopify.com" \
  http://localhost:3000/products/showcased
```

```typescript
const res = await client("/products/showcased");
const showcased = res.data as Product[];
```

#### GET `/products/filters`
- Returns available product filters.

```bash
curl -H "x-shop-domain: your-shop.myshopify.com" \
  http://localhost:3000/products/filters
```

```typescript
const res = await client("/products/filters");
const filters = res.data as Filters;
```

#### GET `/products/:handle`
- Returns a single product by handle.

```bash
curl -H "x-shop-domain: your-shop.myshopify.com" \
  http://localhost:3000/products/example-handle
```

```typescript
const res = await client("/products/:handle", { params: { handle: "example-handle" } });
const product = res.data as Product; // 404/500 if missing
```

#### POST `/products/:handle/enriched`
- Returns enriched product content.

```bash
curl -X POST -H "x-shop-domain: your-shop.myshopify.com" \
  -H "Content-Type: application/json" \
  -d '{ "model": "gpt-4o-mini", "outputFormat": "markdown" }' \
  http://localhost:3000/products/example-handle/enriched
```

```typescript
const res = await client("/products/:handle/enriched", {
  params: { handle: "example-handle" },
  body: { model: "gpt-4o-mini", outputFormat: "markdown" }
});
const enrichedProduct = res.data as Product; // `enriched_content` may be present
```

#### POST `/products/:handle/classify`
- Classifies product audience/vertical.

```bash
curl -X POST -H "x-shop-domain: your-shop.myshopify.com" \
  -H "Content-Type: application/json" \
  -d '{ "model": "gpt-4o-mini" }' \
  http://localhost:3000/products/example-handle/classify
```

```typescript
const res = await client("/products/:handle/classify", {
  params: { handle: "example-handle" },
  body: { model: "gpt-4o-mini" }
});
const classification = res.data as ProductClassification;
```

#### POST `/products/:handle/seo`
- Generates product SEO content.

```bash
curl -X POST -H "x-shop-domain: your-shop.myshopify.com" \
  -H "Content-Type: application/json" \
  -d '{ "model": "gpt-4o-mini" }' \
  http://localhost:3000/products/example-handle/seo
```

```typescript
const res = await client("/products/:handle/seo", {
  params: { handle: "example-handle" },
  body: { model: "gpt-4o-mini" }
});
const seo = res.data as SEOContent;
```

## Advanced Usage

### Merge with Existing Routers
Compose endpoints from this package with your own endpoints into a single router.

```typescript
import { createRouter } from "better-call";
import { makeGetShop, buildStoreEndpoints, buildProductEndpoints } from "better-shop";

const getShop = makeGetShop();
const store = buildStoreEndpoints(getShop);
const products = buildProductEndpoints(getShop);

// Your custom endpoints
import { createEndpoint } from "better-call";
const health = createEndpoint("/health", { method: "GET" }, async () => ({ ok: true }));

export const app = createRouter(
  { ...store, ...products, health },
  { openapi: { disabled: false, path: "/api/reference" } },
);
```

### Customize OpenAPI UI
Set the docs path and Scalar UI settings when creating the router.

```typescript
import { betterShop } from "better-shop";

export const router = betterShop();
// or compose manually
// export const router = createRouter(endpoints, {
//   openapi: {
//     disabled: false,
//     path: "/api/reference",
//     scalar: { title: "Better Shop API", theme: "dark" },
//   },
// });
```

### Add a Custom Endpoint Using `getShop`

```typescript
import { createRouter, createEndpoint } from "better-call";
import { makeGetShop } from "better-shop";

const getShop = makeGetShop();

const getCurrency = createEndpoint("/currency", { method: "GET" }, async (ctx) => {
  const shop = getShop(ctx.headers);
  const info = await shop.getInfo();
  return { currency: info.currency };
});

export const router = createRouter({ getCurrency }, { openapi: { disabled: false } });
```

### Tree-Shaking and Bundle Size
- Prefer ESM and named imports to allow bundlers to remove unused exports.
- Import only the builders you need, e.g. `buildProductEndpoints`.

### Integration Testing
Use `better-call/client` to test your composed router end-to-end.

```typescript
import { createClient } from "better-call/client";
import type { betterShop } from "better-shop";

type ShopRouter = ReturnType<typeof betterShop>;

const client = createClient<ShopRouter>({
  baseURL: "http://localhost:3000",
  headers: { "x-shop-domain": "your-shop.myshopify.com" },
});

const res = await client("/info");
if (res.error) throw new Error(String(res.error));
```

#### GET `/collections/all`
- Returns all collections.

```bash
curl -H "x-shop-domain: your-shop.myshopify.com" \
  http://localhost:3000/collections/all
```

```typescript
const res = await client("/collections/all");
const collections = res.data as Collection[];
```

#### GET `/collections/paginated`
- Returns paginated collections.

```bash
curl -H "x-shop-domain: your-shop.myshopify.com" \
  "http://localhost:3000/collections/paginated?page=1&limit=10"
```

```typescript
const res = await client("/collections/paginated", { query: { page: 1, limit: 10 } });
const collections = res.data as Collection[];
```

#### GET `/collections/:handle`
- Returns a collection by handle.

```bash
curl -H "x-shop-domain: your-shop.myshopify.com" \
  http://localhost:3000/collections/example-handle
```

```typescript
const res = await client("/collections/:handle", { params: { handle: "example-handle" } });
const collection = res.data as Collection;
```

#### GET `/collections/:handle/products/all`
- Returns all products in a collection.

```bash
curl -H "x-shop-domain: your-shop.myshopify.com" \
  "http://localhost:3000/collections/example-handle/products/all?currency=USD"
```

```typescript
const res = await client("/collections/:handle/products/all", {
  params: { handle: "example-handle" },
  query: { currency: "USD" }
});
const products = res.data as Product[];
```

#### GET `/collections/:handle/products/paginated`
- Returns paginated products within a collection.

```bash
curl -H "x-shop-domain: your-shop.myshopify.com" \
  "http://localhost:3000/collections/example-handle/products/paginated?page=1&limit=10&currency=USD"
```

```typescript
const res = await client("/collections/:handle/products/paginated", {
  params: { handle: "example-handle" },
  query: { page: 1, limit: 10, currency: "USD" }
});
const products = res.data as Product[];
```

#### GET `/collections/:handle/slugs`
- Returns product slugs within a collection.

```bash
curl -H "x-shop-domain: your-shop.myshopify.com" \
  http://localhost:3000/collections/example-handle/slugs
```

```typescript
const res = await client("/collections/:handle/slugs", { params: { handle: "example-handle" } });
const slugs = res.data as string[];
```

#### POST `/checkout/url`
- Generates a pre-filled checkout URL.

```bash
curl -X POST -H "x-shop-domain: your-shop.myshopify.com" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "items": [{ "productVariantId": "gid://shopify/ProductVariant/123", "quantity": "1" }],
    "address": { "firstName": "John", "lastName": "Doe", "address1": "123 St", "city": "City", "zip": "12345", "country": "US", "province": "CA", "phone": "1234567890" }
  }' \
  http://localhost:3000/checkout/url
```

```typescript
const res = await client("/checkout/url", {
  body: {
    email: "test@example.com",
    items: [{ productVariantId: "gid://shopify/ProductVariant/123", quantity: "1" }],
    address: { firstName: "John", lastName: "Doe", address1: "123 St", city: "City", zip: "12345", country: "US", province: "CA", phone: "1234567890" }
  }
});
const checkout = res.data as CheckoutUrl;
```

## License

MIT
