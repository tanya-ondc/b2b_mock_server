// new code utils
import { Edge, MarkerType, Node } from "reactflow";
import { CustomNodeData } from "../components";
import { Theme } from "@mui/material/styles";
import {
	PREV_ACTION,
	PREV_ACTION_LOGISTICS,
	PREV_SUBSCRIPTION_EMANDATE_ACTION,
} from "openapi-specs/constants";
import { ACTION_PRECENDENCE } from "./constants";

// Create a map to assign precedence values to action strings
const precedenceMap: { [key: string]: number } = {};
ACTION_PRECENDENCE.forEach((action, index) => {
	precedenceMap[action] = index;
});

// Comparator function to sort objects based on the precedence of the "action" property
export const actionComparator = (
	a: { action: string },
	b: { action: string }
) => {
	const precedenceA = precedenceMap[a.action] ?? Infinity; // Default to Infinity if action is not found
	const precedenceB = precedenceMap[b.action] ?? Infinity; // Default to Infinity if action is not found
	return precedenceA - precedenceB;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getNodesAndEdges = (formattedResponse: any, theme: Theme) => {
	const { transaction_id, bpp_id, bpp_uri, bap_id, bap_uri } =
		formattedResponse.length > 1
			? formattedResponse[1].request.context
			: formattedResponse[0].request.context;

	const nodes: Node<CustomNodeData>[] = [
		{
			id: `${transaction_id}-buyer`,
			position: { x: 50, y: 0 },
			style: { width: "1000px", height: "80px" },
			data: { title: "Buyer App Node", subline: bap_id, uri: bap_uri },
			type: "custom",
		},
		{
			id: `${transaction_id}-seller`,
			position: { x: 50, y: 420 },
			style: { width: "1000px", height: "80px" },
			data: { title: "Seller App Node", subline: bpp_id, uri: bpp_uri },
			type: "custom",
		},
	];
	const edges: Edge[] = [];
	let initialX = 50;

	// Determine the domain (assume domain info is available in the response)
	const domain = formattedResponse[0].domain?.toLowerCase() || "services"; // Default to "services" if domain is not provided
	// Choose the correct mapping based on the domain
	const prevActionMapping =
		domain === "logistics"
			? PREV_ACTION_LOGISTICS
			: formattedResponse &&
			formattedResponse[5] &&
			formattedResponse[5]?.request?.message?.order?.payments[0].tags[0]
					.list[0].value
			? PREV_SUBSCRIPTION_EMANDATE_ACTION
			: PREV_ACTION;

	formattedResponse.forEach(
		(log: {
			id?: string;
			action: string;
			request: {
				context: { message_id: string };
				message: { order: { ref_order_ids: string[] } };
			};
		}) => {
			const {
				request: {
					context: { message_id },
				},
			} = log;

			if (log.action.startsWith("on_")) {
				nodes.push({
					// id: `${transaction_id}-${log.action}-${message_id}`,
					// id: log.action === "on_confirm" && log.id ? `${transaction_id}-${log.action}-${message_id}-${log.id}` : `${transaction_id}-${log.action}-${message_id}`,
					id: `${transaction_id}-${log.action}-${message_id}-${log.id}`,
					position: { x: initialX, y: 300 },
					data: { title: log.action, log: log },
					type: "custom",
				});
				initialX += 200;
			} else {
				nodes.push({
					id: `${transaction_id}-${log.action}-${message_id}-${log.id}`,
					position: { x: initialX, y: 100 },
					data: { title: log.action, log: log },
					type: "custom",
				});
			}

			let previousActions;
			let _prevAction: string;
			let prevAction: string = log.action;

			do {
				_prevAction = prevAction;
				prevAction =
					prevActionMapping[_prevAction as keyof typeof prevActionMapping];
				previousActions = formattedResponse.filter(
					(e: {
						action: string;
						request: { context: { message_id: string } };
					}) => {
						if (e.action === prevAction) {
							if (
								e.request.context.message_id === log.request.context.message_id
							) {
								return true;
							} else if (!_prevAction.startsWith("on_")) {
								return true;
							}
						}
						return false;
					}
				);
			} while (previousActions.length === 0 && prevAction);

			if (previousActions.length > 0) {
				const prevMessageId = previousActions[0].request.context.message_id;
				let sourceId = 0;
				if (
					log.request.message?.order &&
					log.request.message?.order?.ref_order_ids
				) {
					formattedResponse.find((obj: any) => {
						if (
							obj.request.message?.order?.id ===
							log.request.message.order.ref_order_ids
						) {
							sourceId = obj.id;
						}
					});
				}
				edges.push({
					id: `e-${transaction_id}-${prevAction}-${log.action}-${message_id}-${log.id}`,
					source: `${transaction_id}-${prevAction}-${prevMessageId}-${sourceId}`,
					target: `${transaction_id}-${log.action}-${message_id}-${log.id}`,
					type: "custom",
					markerEnd: {
						type: MarkerType.Arrow,
						color: theme.palette.primary.dark,
					},
					animated: log.action.startsWith("on_"),
				});
			}
		}
	);
	console.log(edges);
	console.log(nodes);
	console.log("EDGES LENGTH :::", edges.length);
	console.log("NODE LENGTH :::", nodes.length);

	return { nodes, edges };
};

export const _getNodesAndEdges = (formattedResponse: any, theme: Theme) => {
	const { transaction_id, bpp_id, bpp_uri, bap_id, bap_uri } =
		formattedResponse.length > 1
			? formattedResponse[1].request.context
			: formattedResponse[0].request.context;

	const nodes: Node<CustomNodeData>[] = [
		{
			id: `${transaction_id}-buyer`,
			position: { x: 50, y: 0 },
			style: { width: "1000px", height: "80px" },
			data: { title: "Buyer App Node", subline: bap_id, uri: bap_uri },
			type: "custom",
		},
		{
			id: `${transaction_id}-seller`,
			position: { x: 50, y: 420 },
			style: { width: "1000px", height: "80px" },
			data: { title: "Seller App Node", subline: bpp_id, uri: bpp_uri },
			type: "custom",
		},
	];
	const edges: Edge[] = [];
	let initialX = 50;

	// Determine the domain (assume domain info is available in the response)
	// const domain = formattedResponse[0].domain?.toLowerCase() || "services"; // Default to "services" if domain is not provided

	// Choose the correct mapping based on the domain
	// const prevActionMapping =
	// 	domain === "logistics"
	// 		? PREV_ACTION_LOGISTICS
	// 		: formattedResponse &&
	// 		  formattedResponse[5] &&
	// 		  formattedResponse[5]?.request?.message?.order?.payments[0].tags[0]
	// 				.list[0].value
	// 		? PREV_SUBSCRIPTION_EMANDATE_ACTION
	// 		: PREV_ACTION;

	// formattedResponse = formattedResponse.sort(
	// 	(a: any, b: any) =>
	// 		new Date(a.request.context.timestamp) <
	// 		new Date(b.request.context.timestamp)
	// );
	formattedResponse = formattedResponse.sort(
		(a: any, b: any) =>
			new Date(a.request.context.timestamp).getTime() -
			new Date(b.request.context.timestamp).getTime()
	);

	formattedResponse.forEach(
		(
			log: {
				id?: string;
				action: string;
				request: {
					context: { message_id: string };
					message: { order: { ref_order_ids: string[] } };
				};
				timestamp: string;
			},
			index: number
		) => {
			const {
				request: {
					context: { message_id },
				},
			} = log;

			if (log.action.startsWith("on_")) {
				nodes.push({
					// id: `${transaction_id}-${log.action}-${message_id}`,
					// id: log.action === "on_confirm" && log.id ? `${transaction_id}-${log.action}-${message_id}-${log.id}` : `${transaction_id}-${log.action}-${message_id}`,
					id: `${transaction_id}-${log.action}-${message_id}-${log.id}-${log.timestamp}`,
					position: { x: initialX, y: 300 },
					data: { title: log.action, log: log },
					type: "custom",
				});
				initialX += 200;
			} else {
				nodes.push({
					id: `${transaction_id}-${log.action}-${message_id}-${log.id}-${log.timestamp}`,
					position: { x: initialX, y: 100 },
					data: { title: log.action, log: log },
					type: "custom",
				});
			}

			for (let i = index - 1; i >= 0; i--) {
				if (formattedResponse[i].id === log.id) {
					edges.push({
						id: `e-${transaction_id}-${formattedResponse[i].action}-${log.action}-${message_id}-${log.id}-${log.timestamp}`,
						source: `${transaction_id}-${formattedResponse[i].action}-${formattedResponse[i].request.context.message_id}-${log.id}-${formattedResponse[i].timestamp}`,
						target: `${transaction_id}-${log.action}-${message_id}-${log.id}-${log.timestamp}`,
						type: "custom",
						markerEnd: {
							type: MarkerType.Arrow,
							color: theme.palette.primary.dark,
						},
						animated: log.action.startsWith("on_"),
					});
					break;
				}
			}
		}
	);
	console.log(edges);
	console.log(nodes);
	console.log("EDGES LENGTH :::", edges.length);
	console.log("NODE LENGTH :::", nodes.length);

	return { nodes, edges };
};

type CopyCallbackFn = () => void;

export const copyToClipboard = (body: object, callback?: CopyCallbackFn) => {
	navigator.clipboard
		.writeText(JSON.stringify(body))
		.then(() => {
			if (callback) callback();
		})
		.catch((err) => {
			console.log(err.message);
		});
};

export const checker = (
	arr: string[],
	target: string[],
	domain?: string,
	version?: string
) => {
	if (
		domain === "services" ||
		domain === "logistics" ||
		domain === "agri" ||
		domain === "subscription"
	) {
		target = target.filter((item) => item !== "version");
	}

	if (domain === "retail" && version === "b2c") {
		target = target.filter((item) => item !== "scenario");
	}
	if (domain !== "logistics")
		target = target.filter((item) => item !== "deliveryType");

	if (domain === "agrioutput")
		target = target.filter((item) => item !== "version");
	console.log("array",arr,target,domain)
	return target.every((v) => arr.includes(v));
};
