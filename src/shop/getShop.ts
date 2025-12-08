import { ShopClient, type ShopClientOptions } from "shop-client";

export const makeGetShop = (options?: ShopClientOptions) => {
	return (headers?: Headers) => {
		const domain = headers?.get("x-shop-domain");
		if (!domain) {
			throw new Error("x-shop-domain header is required");
		}
		return new ShopClient(domain, options);
	};
};
