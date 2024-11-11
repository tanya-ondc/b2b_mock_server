import { createSigningString, signMessage } from "./crypto";

export const createAuthHeader = async (message: object) => {
	const { signing_string, expires, created } = await createSigningString(
		JSON.stringify(message)
	);
	const signature = await signMessage(
		signing_string,
		process.env.PRIVATE_KEY || ""
	);
	const header = `Signature keyId="${process.env.SUBSCRIBER_ID}|${process.env.UNIQUE_KEY}|ed25519",algorithm="ed25519",created="${created}",expires="${expires}",headers="(created) (expires) digest",signature="${signature}"`;
	return header;
};
