import { describe, expect, it, mock } from "bun:test";
import { betterShop } from "../src/shop-service";

// Mock shop-client only for ShopClient class to satisfy makeGetShop usage
mock.module("shop-client", () => {
	return {
		ShopClient: class MockShopClient {
			constructor(domain: string) {}
		},
		// Expose the utilities used by endpoints
		calculateDiscount: (price: number, compareAtPrice?: number) => {
			if (!compareAtPrice || compareAtPrice <= 0) return 0;
			return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
		},
		generateStoreSlug: (domain: string) =>
			String(domain).replace(/\W+/g, "-").toLowerCase(),
		genProductSlug: ({
			handle,
			storeDomain,
		}: {
			handle: string;
			storeDomain: string;
		}) => `${storeDomain}-${handle}`.replace(/\W+/g, "-").toLowerCase(),
		extractDomainWithoutSuffix: (domain: string) => {
			const d = String(domain)
				.toLowerCase()
				.replace(/^www\./, "");
			const parts = d.split(".");
			if (parts.length < 2) return null;
			const last = parts[parts.length - 1];
			const secondLast = parts[parts.length - 2];
			if (secondLast === "co" && last === "uk") {
				return parts[parts.length - 3] ?? null;
			}
			return parts[parts.length - 2] ?? null;
		},
		sanitizeDomain: (input: string, opts?: { stripWWW?: boolean }) => {
			let d = String(input)
				.trim()
				.replace(/^\w+:\/\//, "");
			d = d.replace(/\/.*$/, "").replace(/:\d+$/, "");
			if (opts?.stripWWW) d = d.replace(/^www\./, "");
			return d.toLowerCase();
		},
		safeParseDate: (input?: string | null) => {
			if (!input) return undefined;
			const d = new Date(input);
			return Number.isNaN(d.getTime()) ? undefined : d;
		},
	};
});

describe("Utils endpoints", () => {
	const router = betterShop();

	const call = async (
		path: string,
		method = "GET",
		body?: unknown,
		headers: Record<string, string> = {},
	): Promise<any> => {
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
		return res.status === 200 ? await res.json() : { status: res.status };
	};

	// removed endpoints: discount, sanitize-domain

	it("generates store slug", async () => {
		const res = await call("/utils/store-slug?domain=Shop.Example.com");
		expect(res.slug).toContain("shop-example-com");
	});

	it("generates product slug", async () => {
		const res = await call(
			"/utils/product-slug?handle=cool-shirt&domain=shop.example.com",
		);
		expect(res.slug).toContain("shop-example-com-cool-shirt");
	});

	// removed endpoint: extract-domain
});
