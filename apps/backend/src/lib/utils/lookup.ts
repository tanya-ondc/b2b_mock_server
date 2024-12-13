import axios from "axios";
import { SubscriberDetail } from "../../interfaces";

import { REGISTRY_URL } from "./constants";

import { redis } from "./redis";

export async function getSubscriberDetails(
	subscriber_id: string,
	unique_key_id: string
) {

	const data = await redis.get(
		`subscriber_data-${subscriber_id}-${unique_key_id}`
	);
	let subscribers = data ? JSON.parse(data) : [];

	if (subscribers?.length === 0) {
		const response = await axios.post(REGISTRY_URL, {
			subscriber_id,
			ukId: unique_key_id,
		});
		response.data
			.map((data: object) => {
				const { subscriber_url, ...subscriberData } = data as SubscriberDetail;
				return {
					...subscriberData,
					unique_key_id: subscriber_url,
				};
			})
			.forEach((data: any) => {
				try {
					subscribers?.push({
						subscriber_id: data.subscriber_id,
						unique_key_id: data.ukId,
						type: data.type,
						signing_public_key: data.signing_public_key,
						valid_until: data.valid_until,
					});
				} catch (error) {
					console.log(error);
				}
			});

		try {
			await redis.set(
				`subscriber_data-${subscribers[0].subscriber_id}-${subscribers[0].unique_key_id}`,
				JSON.stringify(response.data),
				"EX",
				432000
			);
		} catch (err) {
			console.error("Error setting subscriber_data in Redis:", err);
		}

	}
	return subscribers;
}
