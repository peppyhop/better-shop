import { type } from "arktype";
import { createEndpoint } from "better-call";
import type { ShopClient } from "shop-client";

export const buildCollectionEndpoints = (
	getShop: (headers?: Headers) => ShopClient,
) => {
	const getAllCollections = createEndpoint(
		"/collections/all",
		{
			method: "GET",
			metadata: {
				openapi: {
					summary: "Get all collections",
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
			return await shop.collections.all();
		},
	);

	const getPaginatedCollections = createEndpoint(
		"/collections/paginated",
		{
			method: "GET",
			query: type({ "page?": "string|number", "limit?": "string|number" }).pipe(
				(v) => ({
					page: v.page ? Number(v.page) : undefined,
					limit: v.limit ? Number(v.limit) : undefined,
				}),
			),
			metadata: {
				openapi: {
					summary: "Get paginated collections",
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
			return await shop.collections.paginated({
				page: ctx.query.page,
				limit: ctx.query.limit,
			});
		},
	);

	const getShowcasedCollections = createEndpoint(
		"/collections/showcased",
		{
			method: "GET",
			metadata: {
				openapi: {
					summary: "Get showcased collections",
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
			return await shop.collections.showcased();
		},
	);

	const getCollection = createEndpoint(
		"/collections/:handle",
		{
			method: "GET",
			metadata: {
				openapi: {
					summary: "Get collection by handle",
					parameters: [
						{
							in: "path",
							name: "handle",
							required: true,
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
			const collection = await shop.collections.find(ctx.params.handle);
			if (!collection) throw new Error("Collection not found");
			return collection;
		},
	);

	const getCollectionProductsAll = createEndpoint(
		"/collections/:handle/products/all",
		{
			method: "GET",
			query: type({ "currency?": "string" }),
			metadata: {
				openapi: {
					summary: "Get all products in collection",
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
			return await shop.collections.products.all(ctx.params.handle, {
				currency: ctx.query?.currency,
			});
		},
	);

	const getCollectionProductsPaginated = createEndpoint(
		"/collections/:handle/products/paginated",
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
					summary: "Get paginated products in collection",
					parameters: [
						{
							in: "path",
							name: "handle",
							required: true,
							schema: { type: "string" },
						},
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
			return await shop.collections.products.paginated(ctx.params.handle, {
				page: ctx.query.page,
				limit: ctx.query.limit,
				currency: ctx.query.currency,
			});
		},
	);

	const getCollectionProductSlugs = createEndpoint(
		"/collections/:handle/slugs",
		{
			method: "GET",
			metadata: {
				openapi: {
					summary: "Get product slugs in collection",
					parameters: [
						{
							in: "path",
							name: "handle",
							required: true,
							schema: { type: "string" },
						},
					],
					responses: {
						200: {
							description: "OK",
							content: {
								"application/json": {
									schema: { type: "array", items: { type: "string" } },
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			return await shop.collections.products.slugs(ctx.params.handle);
		},
	);

	return {
		getAllCollections,
		getPaginatedCollections,
		getShowcasedCollections,
		getCollection,
		getCollectionProductsAll,
		getCollectionProductsPaginated,
		getCollectionProductSlugs,
	};
};
