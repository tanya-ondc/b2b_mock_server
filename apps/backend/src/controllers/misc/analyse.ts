/********ANALYSE NEW CODE FOR UPDATE AND ON UPDATE (KEY AND TIMESTAMP SEND IN API )*/
import { Request, Response } from "express";
import { redis } from "../../lib/utils";

export const analyseController = async (req: Request, res: Response) => {
	var storedTransaction: object[] = [];
	const transactionId = req.params["transactionId"];
	if (!transactionId)
		return res.status(400).json({
			message: {
				ack: {
					status: "NACK",
				},
			},
			error: {
				message: "Transaction ID not specified",
			},
		});
	const transactionKeys = await redis.keys(`${transactionId}-*`);

	if (transactionKeys.length === 0) return res.json([]);

	if (
		transactionKeys.filter(
			(e) =>
				e.match(
					/-from-server(?:-(\d+))?(?:-(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z))?$/
				) != null ||
				e.match(
					/-to-server(?:-(\d+))?(?:-(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z))?$/
				) != null
		).length > 0
	) {
		var _transactionsKeys = transactionKeys.filter(
			(e) =>
				e.match(
					/-from-server(?:-(\d+))?(?:-(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z))?$/
				) ||
				e.match(
					/-to-server(?:-(\d+))?(?:-(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z))?$/
				)
		);
		var transactions = await redis.mget(_transactionsKeys);
		storedTransaction.push(
			transactions.map((each, index) => {
				let _key = _transactionsKeys[index].match(
					/-from-server(?:-(\d+))?(?:-(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z))?$/
				);
				if (!each) return null;
				var parsed = JSON.parse(each);
				return {
					...parsed,
					id: _key ? _key[1] : "0",
					type: "from_server",
					action: (parsed.request as any).context.action,
					timestamp: _key ? _key[2] : (parsed.request as any).context.timestamp,
				};
			})
		);
	}
	// if (transactionKeys.filter((e) => e.match(/-from-server-(\d+)$/) != null).length > 0) {
	//   var _transactionsKeys = transactionKeys.filter((e) => e.match(/-from-server-(\d+)$/));
	//   var transactions = await redis.mget(_transactionsKeys);
	//   storedTransaction.push(
	//     transactions.map((each, index) => {
	//       let _key = _transactionsKeys[index].match(/-from-server-(\d+)$/);
	//       if (!each) return null;
	//       var parsed = JSON.parse(each);
	//       return {
	//         ...parsed,
	//         id: _key ? _key[1] : '0',
	//         type: "from_server",
	//         action: (parsed.request as any).context.action,
	//         timestamp: (parsed.request as any).context.timeStamp,
	//       };
	//     })
	//   );
	// }
	console.log('storedTransaction.flat()', storedTransaction.flat())
	return res.json(storedTransaction.flat());
};
