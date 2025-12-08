import { type } from "arktype";
import { createEndpoint } from "better-call";
import type { ShopClient } from "shop-client";

export const buildCheckoutEndpoints = (
	getShop: (headers?: Headers) => ShopClient,
) => {
	const createCheckoutUrl = createEndpoint(
		"/checkout/url",
		{
			method: "POST",
			body: type({
				email: "string.email",
				items: type({ productVariantId: "string", quantity: "string" }).array(),
				address: {
					firstName: "string",
					lastName: "string",
					address1: "string",
					city: "string",
					zip: "string",
					country: "string",
					province: "string",
					phone: "string",
				},
			}),
			metadata: {
				openapi: {
					summary: "Create checkout URL",
					requestBody: {
						content: { "application/json": { schema: { type: "object" } } },
					},
					responses: {
						200: {
							description: "OK",
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: { url: { type: "string" } },
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
			return { url: shop.checkout.createUrl(ctx.body) };
		},
	);

	return { createCheckoutUrl };
};
