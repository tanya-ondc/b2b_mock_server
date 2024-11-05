/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { checker, CITY_CODE, INITIATE_FIELDS } from "../../utils";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
// import { CITY_CODE } from "../../utils/constants";
import { Input, Option, Select, Button } from "@mui/joy";
import axios, { AxiosError } from "axios";
import Divider from "@mui/material/Divider";
import Grow from "@mui/material/Grow";
import { useDomain, useMessage } from "../../utils/hooks";
import HelpOutlineTwoToneIcon from "@mui/icons-material/HelpOutlineTwoTone";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

// import { Item } from "common/index";
// type InitiateRequestSectionProp = {
// 	domain:
// 		| "b2b"
// 		| "b2c"
// 		| "services"
// 		| "retail"
// 		| "subscription"
// 		| "agri-services"
// 		| "healthcare-services"
// 		| "agri-equipment-hiring"
// 		| "logistics";
// };

type SELECT_OPTIONS =
	| string[]
	| { b2b: string[]; services: string[]; b2c: string[] }
	| { b2b: string[]; services: string[]; b2c: string[] }
	| { services: string[] }
	| { logistics: string[] }
	| { b2c: string[] }
	| object;

// type SELECT_FIELD = {
// 	name: string;
// 	placeholder: string;
// 	type: string;
// 	domainDepended: boolean;
// 	versionDepended: boolean;
// 	options: SELECT_OPTIONS;
// };

type OptionsType = {
	retail: string[];
	subscription: string[];
	b2b: string[];
	b2c: string[];
};

type Version = keyof OptionsType;

export const InitiateRequestSection = () => {
	const { handleMessageToggle, setMessageType, setCopy } = useMessage();
	const [action, setAction] = useState<string>();
	const { domain } = useDomain();
	const [domainOptions, setDomainOptions] = useState<string[]>([]);
	const [, setScenarioOptions] = useState<string[]>([]);
	const [cityOptions, setCityOptions] = useState<string[]>([]);
	const [version, setVersion] = useState<string>("services");
	const [selectedScenario, setSelectedScenario] = useState<string>("default");
	const [renderActionFields, setRenderActionFields] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [formState, setFormState] = useState<{ [key: string]: any }>({});
	const [allowSubmission, setAllowSubmission] = useState<boolean>(false);
	const [transactionId, setTransactionId] = useState<string>("");
	const [showCatalogSelect, setShowCatalogSelect] = useState<boolean>(false);
	const [matchingItems, setMatchingItems] = useState<any[]>([]);
	const [selectedItemId, setSelectedItemId] = useState<string>("");

	useEffect(() => {
		// setRenderActionFields(true);
		setAction("");
	}, [domain]);

	const handleSelectionChange = (
		_event: React.SyntheticEvent | null,
		newValue: string | null
	) => {
		setSelectedItemId(newValue as string | "");
		setFormState((prev) => ({ ...prev, ["itemID"]: newValue }));
	};

	const handleTransactionIdSubmit = async () => {
		try {
			const response = await axios.post<{
				message: { matchingItems: any[] };
			}>(
				`${
					import.meta.env.VITE_SERVER_URL
				}/${domain.toLowerCase()}/getCatalog/?mode=mock`,
				{ transactionId },
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (response.data && response.data.message) {
				setMatchingItems(response.data.message.matchingItems);
				setShowCatalogSelect(true);
			} else {
				// Handle error or unexpected response
				console.error("Unexpected response format:", response.data);
			}
		} catch (error) {
			setShowCatalogSelect(false);
			console.error("Error fetching catalog:", error);
			// Handle error (e.g., show error message to user)
		}
	};

	const handleActionSelection = (
		_event: React.SyntheticEvent | null,
		newValue: string | null
	) => {
		setRenderActionFields(false);
		setAction(newValue as string);
		setFormState({});
		setAllowSubmission(false);
		setTimeout(() => setRenderActionFields(true), 500);
		if (domain === "logistics") {
			setTransactionId("");
			setShowCatalogSelect(false);
			setMatchingItems([]);
			setSelectedItemId("");
		}
	};

	const handleFieldChange = (fieldName: string, value: string) => {
		if (fieldName === "version") {
			setVersion(value as string);
			/****Write the logic for changes the domain options based on version selection */
			const newDomainOptions =
				INITIATE_FIELDS.search.find((field) => field.name === "domain")
					?.options?.[version as Version] || [];

			setDomainOptions(newDomainOptions as string[]);

			const newCityOptions =
				INITIATE_FIELDS.search.find((field) => field.name === "city")
					?.options?.[version as Version] || [];

			setCityOptions(newCityOptions as string[]);

			const newScenarioOption =
				INITIATE_FIELDS.search.find((field) => field.name === "scenario")
					?.options?.[version as Version] || [];

			setScenarioOptions(newScenarioOption as string[]);
		}
		if (fieldName === "scenario") {
			setSelectedScenario(value as string);
			/****Write the logic for changes the domain options based on version selection */
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setFormState((prev: any) => ({ ...prev, [fieldName]: value }));
	};

	useEffect(() => {
		if (action) {
			const keys = Object.keys(formState || {});
			const formKeys = INITIATE_FIELDS[
				action as keyof typeof INITIATE_FIELDS
			].map((e) => e.name);

			const scenarios = INITIATE_FIELDS[
				action as keyof typeof INITIATE_FIELDS
			].filter((e) => e.name === "scenario")[0];
			const logisticsInitKeys = ["transactionId", "itemID"];

			const logisticsCancelKeys = [
				"transactionId",
				"cancellationReasonId",
			].every((key) => formKeys.includes(key));

			if (domain === "logistics" && action === "init") {
				// Check if both transactionId and itemID are present in formState
				if (logisticsInitKeys.every((key) => key in formState)) {
					setAllowSubmission(true);
				} else {
					setAllowSubmission(false);
				}
			} else if (
				domain === "logistics" &&
				action === "cancel" &&
				logisticsCancelKeys
			) {
				setAllowSubmission(true);
			} else if (checker(keys, formKeys, domain, version)) {
				setAllowSubmission(true);
			} else if (
				checker(
					keys,
					formKeys.filter((e) => e !== "scenario"),
					domain
				) &&
				scenarios?.domainDepended &&
				!scenarios.options[domain as keyof SELECT_OPTIONS]
			) {
				setAllowSubmission(true);
			} else {
				setAllowSubmission(false);
			}
		}

		const newDomainOptions =
			INITIATE_FIELDS.search.find((field) => field.name === "domain")
				?.options?.[version as Version] || [];

		setDomainOptions(newDomainOptions as string[]);

		const newCityOptions =
			INITIATE_FIELDS.search.find((field) => field.name === "city")?.options?.[
				version as Version
			] || [];

		setCityOptions(newCityOptions as string[]);

		const newScenarioOption =
			INITIATE_FIELDS.search.find((field) => field.name === "scenario")
				?.options?.[version as Version] || [];

		setScenarioOptions(newScenarioOption as string[]);
	}, [action, domain, formState, version]);

	const handleSubmit = async () => {
		try {
			const response = await axios.post(
				`${
					import.meta.env.VITE_SERVER_URL
				}/${domain}/initiate/${action}?mode=mock&version=${version}&scenario=${selectedScenario}`,
				formState,
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (
				response.data.message.ack.status === "ACK" ||
				response.data.sync.message.ack.status === "ACK"
			) {
				if (action === "search") {
					handleMessageToggle(
						`Your Transaction ID is: ${
							response.data.transaction_id
								? response.data.transaction_id
								: response.data.async.context.transaction_id
						}`
					);
					setMessageType("success");
					setCopy(response.data.transaction_id);
				} else {
					handleMessageToggle("Request Initiated Successfully!");
					setMessageType("success");
				}
			} else if (response.data.error) {
				handleMessageToggle(
					`Error Occurred: ${
						response.data.error.message || response.data.error
					}`
				);
				setMessageType("error");
			}
		} catch (error: any) {
			// 	setMessageType("error");
			// 	if (
			// 		error instanceof AxiosError &&
			// 		error.response?.data?.error?.message.error?.message
			// 	) {
			// 		handleMessageToggle(
			// 			error.response?.data?.error?.message.error?.message === "string"
			// 				? error.response?.data?.error?.message.error?.message
			// 				: Array.isArray(
			// 						error.response?.data?.error?.message?.error?.message
			// 				  ) &&
			// 				  error.response?.data?.error?.message?.error?.message.length > 0
			// 				? `${error.response?.data?.error?.message?.error?.message[0]?.message} in ${error.response?.data?.error?.message?.error?.message[0]?.details}`
			// 				: error.response?.data?.error?.message.error?.message
			// 		);
			// 	} else {
			// 		handleMessageToggle(
			// 			error.response?.data?.error?.message
			// 				? error.response?.data?.error?.message
			// 				: "Error Occurred while initiating request!"
			// 		);
			// 	}
			// }
			setMessageType("error");
			if (
				error instanceof AxiosError &&
				error.response?.data?.error?.message.error?.message
			) {
				handleMessageToggle(
					error.response?.data?.error?.message.error?.message === "string"
						? error.response?.data?.error?.message.error?.message
						: Array.isArray(
								error.response?.data?.error?.message?.error?.message
						  ) &&
						  error.response?.data?.error?.message?.error?.message.length > 0
						? `${error.response?.data?.error?.message?.error?.message[0]?.message} in ${error.response?.data?.error?.message?.error?.message[0]?.details}`
						: error.response?.data?.error?.message.error?.message
				);
			} else if (
				error instanceof AxiosError &&
				error.response?.data?.sync?.error.message
			) {
				handleMessageToggle(
					error.response?.data?.sync?.error.message === "string"
						? error.response?.data?.sync?.error.message
						: Array.isArray(error.response?.data?.sync?.error.message) &&
						  error.response?.data?.sync?.error.message.length > 0
						? `${error.response?.data?.sync?.error.message[0].message} in ${error.response?.data?.sync?.error.message[0]?.details}`
						: error.response?.data?.sync?.error.message
				);
			} else if (
				error instanceof AxiosError &&
				error.response?.data?.error?.message
			) {
				handleMessageToggle(
					error.response?.data?.error?.message === "string"
						? error.response?.data?.error?.message
						: Array.isArray(error.response?.data?.error?.message) &&
						  error.response?.data?.error?.message.length > 0
						? `${error.response?.data?.error?.message[0]?.message} in ${error.response?.data?.error?.message[0]?.details}`
						: error.response?.data?.error?.message
				);
			} else {
				handleMessageToggle(
					error.response?.data?.error?.message
						? error.response?.data?.error?.message
						: "Error Occurred while initiating request!"
				);
			}
		}
	};
	return (
		<Fade in={true} timeout={2500}>
			<Paper
				sx={{
					width: "100%",
					p: 1,
					px: 2,
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography variant="h6" my={1} mr={2}>
						Initiate Request:
					</Typography>
					<Tooltip title="Are you a seller app, Initiate Requests here 👇">
						<IconButton>
							<HelpOutlineTwoToneIcon />
						</IconButton>
					</Tooltip>
				</Box>

				<Stack spacing={2} sx={{ my: 2 }}>
					<Select
						placeholder="Select Action"
						value={action}
						onChange={handleActionSelection}
					>
						{Object.keys(INITIATE_FIELDS)
							.filter(
								(action) =>
									!(
										(domain === "logistics" && action === "select") ||
										(domain === "subscription" && action === "update")
									)
							)
							.map((action, idx) => (
								<Option value={action} key={"action-" + idx}>
									{action}
								</Option>
							))}
					</Select>

					<Grow in={renderActionFields} timeout={500}>
						<Stack spacing={2} sx={{ my: 2 }}>
							<Divider />
							{action &&
								INITIATE_FIELDS[action as keyof typeof INITIATE_FIELDS].map(
									(field, index) => {
										// Skip rendering `orderId` if action is "cancel" and domain is "logistics"
										if (
											domain === "logistics" &&
											action === "cancel" &&
											field.name === "orderId"
										) {
											return null;
										}
										if (domain === "logistics" && action === "init") {
											if (index > 0) return <></>;

											return (
												<React.Fragment key={"react-" + action + "-" + index}>
													<Input
														type="text"
														key={"input-" + action + "-" + index}
														value={transactionId}
														placeholder={field.placeholder}
														onChange={(e) => {
															setTransactionId(
																(e.target as HTMLInputElement).value
															);
															handleFieldChange(field.name, e.target.value);
														}}
													/>
													<Button onClick={handleTransactionIdSubmit}>
														Submit
													</Button>
													{showCatalogSelect && (
														<React.Fragment>
															<Select
																id="matchingItemsDropdown"
																value={selectedItemId || ""}
																onChange={(
																	_event: React.SyntheticEvent | null,
																	newValue: string | null
																) =>
																	handleSelectionChange(
																		_event,
																		newValue as string
																	)
																}
																placeholder="Select an item"
															>
																<Option value="" disabled>
																	Select an item
																</Option>
																{matchingItems.map((item) => (
																	<Option key={item.id} value={item.id}>
																		{item.id}
																	</Option>
																))}
															</Select>
														</React.Fragment>
													)}
												</React.Fragment>
											);
										}

										return (
											<React.Fragment key={`field-${action}-${index}`}>
												{field.type === "text" &&
												field.name !== "cancellationReasonId" ? (
													<Input
														fullWidth
														placeholder={field.placeholder}
														key={"input-" + action + "-" + index}
														onChange={(e) =>
															handleFieldChange(field.name, e.target.value)
														}
													/>
												) : field.type === "select" ||
												  (field.type === "text" &&
														field.name === "cancellationReasonId") ? (
													field.domainDepended ? (
														(() => {
															const options = field.options as any;
															// Special case for scenario field
															if (field.name === "scenario") {
																if (
																	options &&
																	domain in options &&
																	Array.isArray(options[domain]) &&
																	options[domain].length > 0
																) {
																	if (
																		version === "b2c" &&
																		domain === "retail"
																	) {
																		return <></>;
																	}
																	return (
																		//   version ==="b2c" && domain==="retail"? (<></>) :
																		<Select
																			placeholder={field.placeholder}
																			onChange={(
																				_event: React.SyntheticEvent | null,
																				newValue: string | null
																			) =>
																				handleFieldChange(
																					field.name,
																					newValue as string
																				)
																			}
																		>
																			{options[domain].map(
																				(
																					option: string,
																					optionIndex: number
																				) => (
																					<Option
																						value={option}
																						key={`${option}-${optionIndex}`}
																					>
																						{option}
																					</Option>
																				)
																			)}
																		</Select>
																	);
																}
																return null; // Render null if domain doesn't exist in options or has no options
															}

															// For other domain-dependent fields
															if (
																options &&
																options[domain] &&
																Array.isArray(options[domain]) &&
																options[domain].length > 0
															) {
																return (
																	<Select
																		placeholder={field.placeholder}
																		onChange={(
																			_event: React.SyntheticEvent | null,
																			newValue: string | null
																		) =>
																			handleFieldChange(
																				field.name,
																				newValue as string
																			)
																		}
																	>
																		{field.name === "domain" &&
																		domain === "retail" ? (
																			<>
																				{domainOptions.map(
																					(option, index: number) => (
																						<Option
																							value={option}
																							key={option + index}
																						>
																							{option}
																						</Option>
																					)
																				)}
																			</>
																		) : field.name === "city" &&
																		  domain === "retail" ? (
																			<>
																				{cityOptions.map(
																					(option, index: number) => (
																						<Option
																							value={option}
																							key={option + index}
																						>
																							{option}
																						</Option>
																					)
																				)}
																			</>
																		) : (
																			options[domain].map(
																				(
																					option: string,
																					optionIndex: number
																				) => (
																					<Option
																						value={option}
																						key={`${option}-${optionIndex}`}
																					>
																						{option}
																					</Option>
																				)
																			)
																		)}
																		{/* {options[domain].map(
																			(option: string, optionIndex: number) => (
																				<Option
																					value={option}
																					key={`${option}-${optionIndex}`}
																				>
																					{option}
																				</Option>
																			)
																		)} */}
																	</Select>
																);
															} else if (
																domain == "logistics" &&
																action == "search"
															) {
																return (
																	<>
																		{field.name !== "version" && (
																			<Select
																				placeholder={field.placeholder}
																				onChange={(
																					_event: React.SyntheticEvent | null,
																					newValue: string | null
																				) =>
																					handleFieldChange(
																						field.name,
																						newValue as string
																					)
																				}
																			>
																				{field.name === "city" ? (
																					formState.domain === "ONDC:LOG10" ? (
																						CITY_CODE.map(
																							(option, optionIndex) => (
																								<Option
																									value={option}
																									key={`${option}-${optionIndex}`}
																								>
																									{option}
																								</Option>
																							)
																						)
																					) : (
																						<Option value="UN:SIN">
																							UN:SIN
																						</Option>
																					)
																				) : field.name === "deliveryType" &&
																				  formState.domain === "ONDC:LOG10" ? (
																					<>
																						<Option value="air">Air</Option>
																						<Option value="surface">
																							Surface
																						</Option>
																					</>
																				) : field.name === "deliveryType" &&
																				  formState.domain !== "ONDC:LOG10" ? (
																					<>
																						<Option value="air">Air</Option>
																						<Option value="ocean">Ocean</Option>
																					</>
																				) : Array.isArray(field.options) ? (
																					field.options.map(
																						(option, optionIndex: number) => {
																							return (
																								<Option
																									value={option}
																									key={`${option}-${optionIndex}`}
																								>
																									{option}
																								</Option>
																							);
																						}
																					)
																				) : null}
																			</Select>
																		)}
																	</>
																);
															}
														})()
													) : (
														<Input
															fullWidth
															placeholder={field.placeholder}
															key={"input-" + action + "-" + index}
															onChange={(e) =>
																handleFieldChange(field.name, e.target.value)
															}
														/>
													)
												) : null}
											</React.Fragment>
										);
									}
								)}
						</Stack>
					</Grow>
				</Stack>
				<Box sx={{ display: "flex", justifyContent: "center" }}>
					<Button
						variant="solid"
						onClick={handleSubmit}
						disabled={!allowSubmission}
					>
						Send
					</Button>
				</Box>
			</Paper>
		</Fade>
	);
};