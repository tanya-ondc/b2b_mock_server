import _sodium, { base64_variants } from "libsodium-wrappers";

export const createSigningString = async (
	message: string,
	created?: string,
	expires?: string
) => {
	//if (!created) created = Math.floor(new Date().getTime() / 1000).toString();
	if (!created)
		created = Math.floor(new Date().getTime() / 1000).toString(); //TO USE IN CASE OF TIME ISSUE
	if (!expires) expires = (parseInt(created) + 1 * 60 * 60).toString(); //Add required time to create expired
	//const digest = createBlakeHash('blake512').update(JSON.stringify(message)).digest("base64");
	//const digest = blake2.createHash('blake2b', { digestLength: 64 }).update(Buffer.from(message)).digest("base64");
	await _sodium.ready;
	const sodium = _sodium;
	const digest = sodium.crypto_generichash(64, sodium.from_string(message));
	const digestBase64 = sodium.to_base64(digest, base64_variants.ORIGINAL);
	

	const signing_string = `(created): ${created}\n(expires): ${expires}\ndigest: BLAKE-512=${digestBase64}`;

	// console.log("MESSAGE", message)
	// console.log("SIGNING STRING", signing_string)
	
	return { signing_string, expires, created };
};

export const signMessage = async (
	signing_string: string,
	privateKey: string
) => {
	console.log("signing_string",signing_string)
	console.log("privateKey",privateKey)
	await _sodium.ready;
	const sodium = _sodium;
	console.log(sodium)
	const signedMessage = sodium.crypto_sign_detached(
		signing_string,
		sodium.from_base64(privateKey, base64_variants.ORIGINAL)
	);
	return sodium.to_base64(signedMessage, base64_variants.ORIGINAL);
};

export const verifyMessage = async (
	signedString: string,
	signingString: string,
	publicKey: string
) => {
	try {
		await _sodium.ready;
		const sodium = _sodium;
		return sodium.crypto_sign_verify_detached(
			sodium.from_base64(signedString, base64_variants.ORIGINAL),
			signingString,
			sodium.from_base64(publicKey, base64_variants.ORIGINAL)
		);
	} catch (error) {
		return false;
	}
};

