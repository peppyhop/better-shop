import { type } from "arktype";
import { createEndpoint } from "better-call";
import type { ShopClient } from "shop-client";

export const buildStoreEndpoints = (
	getShop: (headers?: Headers) => ShopClient,
) => {
	const getInfo = createEndpoint(
		"/info",
		{
			method: "GET",
			query: type({ "force?": "string" }).pipe((v) => ({
				force: v.force === "true",
			})),
			metadata: {
				openapi: {
					summary: "Get store info",
					parameters: [
						{
							in: "query",
							name: "force",
							required: false,
							schema: { type: "boolean" },
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
			return await shop.getInfo({ force: ctx.query?.force });
		},
	);

	const clearInfoCache = createEndpoint(
		"/info/clear-cache",
		{
			method: "POST",
			metadata: {
				openapi: {
					summary: "Clear store info cache",
					responses: {
						200: {
							description: "OK",
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: { success: { type: "boolean" } },
									},
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			shop.clearInfoCache();
			return { success: true };
		},
	);

	const determineStoreType = createEndpoint(
		"/store-type",
		{
			method: "POST",
			body: type({
				"apiKey?": "string",
				"model?": "string",
				"maxShowcaseProducts?": "number",
				"maxShowcaseCollections?": "number",
			}),
			metadata: {
				openapi: {
					summary: "Determine store type",
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
			return await shop.determineStoreType(ctx.body);
		},
	);

	return { getInfo, clearInfoCache, determineStoreType };
};
