import { describe, expect, it, mock } from "bun:test";

// Mock shop-client
mock.module("shop-client", () => {
	return {
		ShopClient: class MockShopClient {
			constructor(domain: string, options: any) {}
			getInfo() {
				return Promise.resolve({
					name: "Mock Store",
					domain: "mock.myshopify.com",
					country: "US",
				});
			}
			clearInfoCache() {}
			determineStoreType() {
				return Promise.resolve({
					vertical: "clothing",
					audience: "adult_male",
				});
			}
			products = {
				all: () => Promise.resolve([{ id: "1", title: "Product 1" }]),
				paginated: (opts: { page?: number }) =>
					Promise.resolve([{ id: "1", title: "Product 1", page: opts.page }]),
				showcased: () =>
					Promise.resolve([{ id: "2", title: "Showcased Product" }]),
				filter: () => Promise.resolve({ Size: ["S", "M"] }),
				find: (handle: string) =>
					handle === "exists"
						? Promise.resolve({ id: "3", title: "Product 3" })
						: Promise.resolve(null),
				enriched: () =>
					Promise.resolve({
						id: "3",
						title: "Product 3",
						enriched_content: "Enriched",
					}),
				classify: () => Promise.resolve({ vertical: "clothing" }),
				generateSEOContent: () => Promise.resolve({ metaTitle: "SEO Title" }),
			};
			collections = {
				all: () => Promise.resolve([{ id: "c1", title: "Collection 1" }]),
				paginated: () => Promise.resolve([{ id: "c1", title: "Collection 1" }]),
				showcased: () =>
					Promise.resolve([{ id: "c2", title: "Showcased Collection" }]),
				find: (handle: string) =>
					handle === "exists"
						? Promise.resolve({ id: "c3", title: "Collection 3" })
						: Promise.resolve(null),
				products: {
					all: () => Promise.resolve([{ id: "p1", title: "Col Product 1" }]),
					paginated: () =>
						Promise.resolve([{ id: "p1", title: "Col Product 1" }]),
					slugs: () => Promise.resolve(["p1-slug"]),
				},
			};
			checkout = {
				createUrl: () => "https://checkout.url",
			};
		},
	};
});

import { betterShop } from "../src/shop-service";

describe("Shop Router", () => {
	const router = betterShop();

	// Helper to call router endpoints
	// better-call endpoints can be called directly if exported, but here they are inside the router.
	// We can use router.handler(request) to test full flow or access endpoints if we exposed them.
	// For integration testing, using router.handler is best as it tests the routing logic too.

	const callEndpoint = async (
		path: string,
		method = "GET",
		body?: unknown,
		headers: Record<string, string> = {},
	): Promise<unknown> => {
		const req = new Request(`http://localhost${path}`, {
			method,
			body: body ? JSON.stringify(body) : undefined,
			headers: {
				...(body ? { "Content-Type": "application/json" } : {}),
				"x-shop-domain": "mock.myshopify.com",
				...headers,
			},
		});
		const res = await router.handler(req);
		if (res.status !== 200) {
			const text = await res.text();
			try {
				return { status: res.status, error: JSON.parse(text) };
			} catch {
				return { status: res.status, error: text };
			}
		}
		return await res.json();
	};

	it("should throw error if x-shop-domain header is missing", async () => {
		const req = new Request("http://localhost/info", {
			method: "GET",
		});
		const res = await router.handler(req);
		expect(res.status).toBe(500);
	});

	it("should fetch store info", async () => {
		const res = (await callEndpoint("/info")) as { name: string };
		expect(res.name).toBe("Mock Store");
	});

	it("should fetch paginated products", async () => {
		const res = (await callEndpoint(
			"/products/paginated?page=2&limit=10",
		)) as Array<{ page: number }>;
		expect(res[0]?.page).toBe(2);
	});

	it("should handle product not found", async () => {
		const res = (await callEndpoint("/products/missing")) as { status: number };
		expect(res.status).toBe(500); // Or 404 depending on how better-call handles thrown errors, usually 500 for generic Error unless caught
	});

	it("should find existing product", async () => {
		const res = (await callEndpoint("/products/exists")) as { title: string };
		expect(res.title).toBe("Product 3");
	});

	it("should create checkout url", async () => {
		const payload = {
			email: "test@example.com",
			items: [{ productVariantId: "123", quantity: "1" }],
			address: {
				firstName: "John",
				lastName: "Doe",
				address1: "123 St",
				city: "City",
				zip: "12345",
				country: "US",
				province: "CA",
				phone: "1234567890",
			},
		};
		const res = (await callEndpoint("/checkout/url", "POST", payload)) as {
			url: string;
		};
		expect(res.url).toBe("https://checkout.url");
	});

	it("should validate checkout payload", async () => {
		const payload = {
			email: "invalid-email", // Invalid
			items: [],
		};
		const res = (await callEndpoint("/checkout/url", "POST", payload)) as {
			status: number;
		};
		expect(res.status).toBe(400); // Zod validation error
	});
});
