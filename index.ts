import { betterShop } from "./src/shop-service";

const router = betterShop({
	cacheTTL: 60_000, // 1 minute cache
});

const server = Bun.serve({
	port: 3000,
	fetch: router.handler,
});

console.log(`Server running at http://localhost:${server.port}`);
