import { createClient } from "better-call/client";
import type { betterShop } from "./src/shop-service";

// We need the type of the router to use the client
type ShopRouter = ReturnType<typeof betterShop>;

const client = createClient<ShopRouter>({
	baseURL: "http://localhost:3000",
	headers: {
		"x-shop-domain": "gymshark.myshopify.com",
	},
});

async function main() {
	console.log("=== Shop Service Test ===\n");

	// 1. Store Info
	console.log("--- Fetching Store Info ---");
	const info = await client("/info");
	if (info.error) {
		console.error("Error fetching info:", info.error);
	} else {
		console.log("Store Name:", info.data?.name);
		console.log("Country:", info.data?.country);
	}

	// 2. Showcased Products
	console.log("\n--- Fetching Showcased Products ---");
	const showcased = await client("/products/showcased");
	if (showcased.error) {
		console.error("Error fetching showcased:", showcased.error);
	} else {
		console.log(`Found ${showcased.data?.length} showcased products`);
		if (showcased.data?.[0]) {
			console.log("First showcased:", showcased.data[0].title);
		}
	}

	// 3. Collections
	console.log("\n--- Fetching Collections ---");
	const collections = await client("/collections/paginated", {
		query: { limit: 5 },
	});
	if (collections.error) {
		console.error("Error fetching collections:", collections.error);
	} else {
		console.log(`Found ${collections.data?.length} collections`);
		collections.data?.forEach((c) => {
			console.log(
				`- ${c.title} (Handle: ${c.handle}, Products: ${c.productsCount})`,
			);
		});
	}

	// 4. Products in a Collection
	if (collections.data && collections.data.length > 0) {
		// Try the second collection if available, or the first
		const collection = collections.data[1] || collections.data[0];
		if (!collection) return;
		const handle = collection.handle;

		console.log(
			`\n--- Fetching Products in Collection: ${collection.title} (Handle: ${handle}) ---`,
		);
		const colProducts = await client(
			"/collections/:handle/products/paginated",
			{
				params: { handle },
				query: { limit: 3 },
			},
		);
		if (colProducts.error) {
			console.error("Error fetching collection products:", colProducts.error);
		} else {
			if (colProducts.data) {
				console.log(`Found ${colProducts.data.length} products in collection`);
				colProducts.data.forEach((p) => {
					console.log(`- ${p.title} (${p.price})`);
				});
			} else {
				console.log("No products found (data is null)");
			}
		}
	}
}

main();
