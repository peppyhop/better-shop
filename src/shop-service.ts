import { createRouter } from "better-call";
import type { ShopClientOptions } from "shop-client";
import { buildCheckoutEndpoints } from "./shop/checkout";
import { buildCollectionEndpoints } from "./shop/collections";
import { makeGetShop } from "./shop/getShop";
import { buildProductEndpoints } from "./shop/products";
import { buildStoreEndpoints } from "./shop/store";

export type { ShopClientOptions } from "shop-client";
export { configureRateLimit } from "shop-client";
export { buildCheckoutEndpoints } from "./shop/checkout";
export { buildCollectionEndpoints } from "./shop/collections";
export { makeGetShop } from "./shop/getShop";
export { buildProductEndpoints } from "./shop/products";
export { buildStoreEndpoints } from "./shop/store";

export const betterShop = (options?: ShopClientOptions) => {
	const getShop = makeGetShop(options);
	const { getInfo, clearInfoCache, determineStoreType } =
		buildStoreEndpoints(getShop);
	const {
		getAllProducts,
		getPaginatedProducts,
		getShowcasedProducts,
		getProductFilters,
		getProduct,
		getEnrichedProduct,
		classifyProduct,
		generateProductSEO,
	} = buildProductEndpoints(getShop);
	const {
		getAllCollections,
		getPaginatedCollections,
		getShowcasedCollections,
		getCollection,
		getCollectionProductsAll,
		getCollectionProductsPaginated,
		getCollectionProductSlugs,
	} = buildCollectionEndpoints(getShop);
	const { createCheckoutUrl } = buildCheckoutEndpoints(getShop);

	return createRouter(
		{
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
		},
		{
			openapi: {
				disabled: false,
				path: "/api/reference",
				scalar: {
					title: "Better Shop API",
					version: "1.0.0",
					description:
						"Type-safe endpoints for Shopify products, collections, store info, and checkout",
					theme: "dark",
				},
			},
		},
	);
};
