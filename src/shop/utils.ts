import { type } from "arktype";
import { createEndpoint } from "better-call";
import type { ShopClient } from "shop-client";
import {
	detectShopCountry,
	generateStoreSlug,
	genProductSlug,
	sanitizeDomain,
} from "shop-client";

export const buildUtilsEndpoints = (
	getShop: (headers?: Headers) => ShopClient,
) => {
	const detectCountry = createEndpoint(
		"/utils/detect-country",
		{
			method: "GET",
			metadata: {
				openapi: {
					summary: "Detect store country from homepage HTML",
					responses: {
						200: {
							description: "OK",
							content: {
								"application/json": {
									schema: {
										type: "object",
									},
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			const shopDomain = ctx.headers?.get("x-shop-domain");
			if (!shopDomain) throw new Error("x-shop-domain header is required");
			const domain = sanitizeDomain(shopDomain, { stripWWW: true });
			const res = await fetch(`https://${domain}`, { redirect: "follow" });
			const html = await res.text();
			return await detectShopCountry(html);
		},
	);

	const getStoreSlug = createEndpoint(
		"/utils/store-slug",
		{
			method: "GET",
			query: type({ "domain?": "string" }),
			metadata: {
				openapi: {
					summary: "Generate store slug from domain",
					parameters: [
						{
							in: "query",
							name: "domain",
							required: false,
							schema: { type: "string" },
						},
					],
					responses: {
						200: {
							description: "OK",
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: { slug: { type: "string" } },
									},
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			const domainInput =
				ctx.query?.domain ?? ctx.headers?.get("x-shop-domain") ?? "";
			const domain = sanitizeDomain(domainInput, { stripWWW: true });
			return { slug: generateStoreSlug(domain) };
		},
	);

	const getProductSlug = createEndpoint(
		"/utils/product-slug",
		{
			method: "GET",
			query: type({ handle: "string", "domain?": "string" }),
			metadata: {
				openapi: {
					summary: "Generate product slug from handle and domain",
					parameters: [
						{
							in: "query",
							name: "handle",
							required: true,
							schema: { type: "string" },
						},
						{
							in: "query",
							name: "domain",
							required: false,
							schema: { type: "string" },
						},
					],
					responses: {
						200: {
							description: "OK",
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: { slug: { type: "string" } },
									},
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			const domainInput =
				ctx.query.domain ?? ctx.headers?.get("x-shop-domain") ?? "";
			const domain = sanitizeDomain(domainInput, { stripWWW: true });
			return {
				slug: genProductSlug({ handle: ctx.query.handle, storeDomain: domain }),
			};
		},
	);

	return {
		detectCountry,
		getStoreSlug,
		getProductSlug,
	};
};
