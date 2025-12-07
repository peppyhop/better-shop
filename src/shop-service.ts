import { type } from "arktype";
import { createEndpoint, createRouter } from "better-call";
import { ShopClient, type ShopClientOptions } from "shop-client";

export type { ShopClientOptions } from "shop-client";
export { configureRateLimit } from "shop-client";

export const betterShop = (options?: ShopClientOptions) => {
	const getShop = (headers?: Headers) => {
		const domain = headers?.get("x-shop-domain");
		if (!domain) {
			throw new Error("x-shop-domain header is required");
		}
		return new ShopClient(domain, options);
	};

	// --- Store Operations ---

	const getInfo = createEndpoint(
		"/info",
		{
			method: "GET",
			query: type({
				"force?": "string",
			}).pipe((v) => ({ force: v.force === "true" })),
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
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			return await shop.determineStoreType(ctx.body);
		},
	);

	// --- Product Operations ---

	const getAllProducts = createEndpoint(
		"/products/all",
		{
			method: "GET",
			query: type({
				"currency?": "string",
			}),
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
			query: type({
				"currency?": "string",
			}),
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			const product = await shop.products.find(ctx.params.handle, {
				currency: ctx.query?.currency,
			});
			if (!product) {
				throw new Error("Product not found");
			}
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
			body: type({
				"apiKey?": "string",
				"model?": "string",
			}),
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
			body: type({
				"apiKey?": "string",
				"model?": "string",
			}),
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			return await shop.products.generateSEOContent(
				ctx.params.handle,
				ctx.body,
			);
		},
	);

	// --- Collection Operations ---

	const getAllCollections = createEndpoint(
		"/collections/all",
		{
			method: "GET",
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
			query: type({
				"page?": "string|number",
				"limit?": "string|number",
			}).pipe((v) => ({
				page: v.page ? Number(v.page) : undefined,
				limit: v.limit ? Number(v.limit) : undefined,
			})),
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
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			const collection = await shop.collections.find(ctx.params.handle);
			if (!collection) {
				throw new Error("Collection not found");
			}
			return collection;
		},
	);

	const getCollectionProductsAll = createEndpoint(
		"/collections/:handle/products/all",
		{
			method: "GET",
			query: type({
				"currency?": "string",
			}),
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
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			return await shop.collections.products.slugs(ctx.params.handle);
		},
	);

	// --- Checkout Operations ---

	const createCheckoutUrl = createEndpoint(
		"/checkout/url",
		{
			method: "POST",
			body: type({
				email: "string.email",
				items: type({
					productVariantId: "string",
					quantity: "string",
				}).array(),
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
		},
		async (ctx) => {
			const shop = getShop(ctx.headers);
			return {
				url: shop.checkout.createUrl(ctx.body),
			};
		},
	);

	return createRouter({
		getInfo,
		clearInfoCache,
		determineStoreType,
		getAllProducts,
		getPaginatedProducts,
		getShowcasedProducts,
		getProductFilters,
		getProduct,
		getEnrichedProduct,
		classifyProduct,
		generateProductSEO,
		getAllCollections,
		getPaginatedCollections,
		getShowcasedCollections,
		getCollection,
		getCollectionProductsAll,
		getCollectionProductsPaginated,
		getCollectionProductSlugs,
		createCheckoutUrl,
	});
};
