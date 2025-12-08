import { type } from "arktype";
import { createEndpoint } from "better-call";
import type { ShopClient } from "shop-client";

export const buildProductEndpoints = (
	getShop: (headers?: Headers) => ShopClient,
) => {
	const getAllProducts = createEndpoint(
		"/products/all",
		{
			method: "GET",
			query: type({ "currency?": "string" }),
			metadata: {
				openapi: {
					summary: "Get all products",
					parameters: [
						{
							in: "query",
							name: "currency",
							required: false,
							schema: { type: "string" },
						},
					],
					responses: {
						200: {
							description: "OK",
							content: {
								"application/json": {
									schema: { type: "array", items: { type: "object" } },
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			return await shop.products.all({ currency: ctx.query?.currency });
		},
	);

	const getPaginatedProducts = createEndpoint(
		"/products/paginated",
		{
			method: "GET",
			query: type({
				"page?": "string|number",
				"limit?": "string|number",
				"currency?": "string",
			}).pipe((v) => ({
				page: v.page ? Number(v.page) : undefined,
				limit: v.limit ? Number(v.limit) : undefined,
				currency: v.currency,
			})),
			metadata: {
				openapi: {
					summary: "Get paginated products",
					parameters: [
						{
							in: "query",
							name: "page",
							required: false,
							schema: { type: "integer", minimum: 1 },
						},
						{
							in: "query",
							name: "limit",
							required: false,
							schema: { type: "integer", minimum: 1, maximum: 250 },
						},
						{
							in: "query",
							name: "currency",
							required: false,
							schema: { type: "string" },
						},
					],
					responses: {
						200: {
							description: "OK",
							content: {
								"application/json": {
									schema: { type: "array", items: { type: "object" } },
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			return await shop.products.paginated({
				page: ctx.query.page,
				limit: ctx.query.limit,
				currency: ctx.query.currency,
			});
		},
	);

	const getShowcasedProducts = createEndpoint(
		"/products/showcased",
		{
			method: "GET",
			metadata: {
				openapi: {
					summary: "Get showcased products",
					responses: {
						200: {
							description: "OK",
							content: {
								"application/json": {
									schema: { type: "array", items: { type: "object" } },
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			return await shop.products.showcased();
		},
	);

	const getProductFilters = createEndpoint(
		"/products/filters",
		{
			method: "GET",
			metadata: {
				openapi: {
					summary: "Get product filters",
					responses: {
						200: {
							description: "OK",
							content: { "application/json": { schema: { type: "object" } } },
						},
					},
				},
			},
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			return await shop.products.filter();
		},
	);

	const getProduct = createEndpoint(
		"/products/:handle",
		{
			method: "GET",
			query: type({ "currency?": "string" }),
			metadata: {
				openapi: {
					summary: "Get product by handle",
					parameters: [
						{
							in: "path",
							name: "handle",
							required: true,
							schema: { type: "string" },
						},
						{
							in: "query",
							name: "currency",
							required: false,
							schema: { type: "string" },
						},
					],
					responses: {
						200: {
							description: "OK",
							content: { "application/json": { schema: { type: "object" } } },
						},
					},
				},
			},
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			const product = await shop.products.find(ctx.params.handle, {
				currency: ctx.query?.currency,
			});
			if (!product) throw new Error("Product not found");
			return product;
		},
	);

	const getEnrichedProduct = createEndpoint(
		"/products/:handle/enriched",
		{
			method: "POST",
			body: type({
				"apiKey?": "string",
				"useGfm?": "boolean",
				"inputType?": "'markdown'|'html'",
				"model?": "string",
				"outputFormat?": "'markdown'|'json'",
			}),
			metadata: {
				openapi: {
					summary: "Get enriched product",
					parameters: [
						{
							in: "path",
							name: "handle",
							required: true,
							schema: { type: "string" },
						},
					],
					requestBody: {
						content: { "application/json": { schema: { type: "object" } } },
					},
					responses: {
						200: {
							description: "OK",
							content: { "application/json": { schema: { type: "object" } } },
						},
					},
				},
			},
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			return await shop.products.enriched(ctx.params.handle, ctx.body);
		},
	);

	const classifyProduct = createEndpoint(
		"/products/:handle/classify",
		{
			method: "POST",
			body: type({ "apiKey?": "string", "model?": "string" }),
			metadata: {
				openapi: {
					summary: "Classify product",
					parameters: [
						{
							in: "path",
							name: "handle",
							required: true,
							schema: { type: "string" },
						},
					],
					requestBody: {
						content: { "application/json": { schema: { type: "object" } } },
					},
					responses: {
						200: {
							description: "OK",
							content: { "application/json": { schema: { type: "object" } } },
						},
					},
				},
			},
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			return await shop.products.classify(ctx.params.handle, ctx.body);
		},
	);

	const generateProductSEO = createEndpoint(
		"/products/:handle/seo",
		{
			method: "POST",
			body: type({ "apiKey?": "string", "model?": "string" }),
			metadata: {
				openapi: {
					summary: "Generate product SEO",
					parameters: [
						{
							in: "path",
							name: "handle",
							required: true,
							schema: { type: "string" },
						},
					],
					requestBody: {
						content: { "application/json": { schema: { type: "object" } } },
					},
					responses: {
						200: {
							description: "OK",
							content: { "application/json": { schema: { type: "object" } } },
						},
					},
				},
			},
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			return await shop.products.generateSEOContent(
				ctx.params.handle,
				ctx.body,
			);
		},
	);

	return {
		getAllProducts,
		getPaginatedProducts,
		getShowcasedProducts,
		getProductFilters,
		getProduct,
		getEnrichedProduct,
		classifyProduct,
		generateProductSEO,
	};
};
