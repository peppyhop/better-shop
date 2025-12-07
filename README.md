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

## License

MIT
