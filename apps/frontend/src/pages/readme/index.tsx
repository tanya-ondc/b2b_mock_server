import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import SearchRequest from "../../assets/images/search_request.png";
import SelectRequest from "../../assets/images/Select_request.png";
import InitRequest from "../../assets/images/init.png";
import ConfirmRequest from "../../assets/images/confirm.png";
import UpdateRequest from "../../assets/images/update_request.png";
import StatusRequest from "../../assets/images/status.png";
import TranslationAnalyser from "../../assets/images/translation_page.png";
import BapSearch from "../../assets/images/BAP_Search.png";

const ONDCDocumentation = () => {
	const coloredJsonString = (jsonString: unknown) => {
		return JSON.stringify(jsonString, null, 2).replace(
			/(".*?": )(".*?")|(\b\d+\b)/g,
			(match, p1, p2) => {
				if (p1 && p2) {
					// Match for string values
					return `<span style="color: blue;">${p1}</span><span style="color: green;">${p2}</span>`;
				} else if (!p1 && !p2) {
					// Match for numbers
					return `<span style="color: red;">${match}</span>`;
				}
				return match;
			}
		);
	};

	// State to hold the text value

	const handleCopyText = (text: unknown) => {

		navigator.clipboard.writeText(JSON.stringify(text)); // Copy text to clipboard
	};

	return (
		<Container
			maxWidth="lg"
			sx={{
				paddingBottom: "20px",
			}}
		>
			<div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
				<h1>ONDC Mock & Sandbox</h1>
				<p>
					To facilitate the development and testing of Buyer Network
					participants or Seller network participants, the ONDC Mock & Sandbox
					provides a simulated environment where developers can test and
					validate their integrations without the need for a counterparty
					network participant.
				</p>
				<p>To start, you need to consider two key questions:</p>
				<ul>
					<li>"To which service am I making requests (BAP or BPP)?"</li>
					<li>"What action/on_action am I going to use?"</li>
				</ul>
				<p>
					With these questions in mind, you can easily construct the URL you
					need to mock and find it among the available options in this guide.
				</p>
				<h2>There are two types of Network Participants (NPs):</h2>
				<ul>
					<li>BPP (Seller app): Handles all the action calls.</li>
					<li>BAP (Buyer app): Handles all the on_action calls.</li>
				</ul>
				<h2> Make a request</h2>
				<p>
					Since you have selected the desired server, now you can make the
					requests to that server. There are two serivces available to test with
					:
				</p>
				<ul>
					<li>SandBox</li>
					<li>Mock</li>
				</ul>
				<p>You can select service from mode dropdown.</p>
				<h3>Sandbox</h3>
				<p>
					To use the sandbox you need to have an authorization header which is
					to be passed in the header to make requests. For creating the
					authorization header you can refer to this
					&nbsp;
					<a
						href="https://docs.google.com/document/d/1brvcltG_DagZ3kGr1ZZQk4hG4tze3zvcxmGV4NMTzr8/edit?pli=1#heading=h.hdylqyv4bn12"
						target="_blank"
					>
						document
					</a>
					.
				</p>
				<h3>Mock</h3>
				<p>
					You can use Mock service to mock the requests. It doesn't require
					authorization header to be passed.
				</p>
				<h3>Request body</h3>
				<p>You can refer these examples for request body.</p>
				<p>
					Note: All the requests must pass the schema validation based on the
					examples. You can refer this log utility for the schema validations.
				</p>
				<h2>Mock Server Usage:</h2>
				<h3>BPP (Seller App) Requests:</h3>
				<p>
					All action calls are hosted on the BPP server. If you want to make
					mock requests to BPP, select (b2b, services, healthcare-services,
					agri-services)/bpp from the servers dropdown.
				</p>
				<h3>BAP (Buyer App) Requests:</h3>
				<p>
					All on_action calls are hosted on the BAP server. If you want to make
					mock requests to BAP or the Buyer app, select (b2b, services,
					healthcare-services, agri-services)/bap from the servers dropdown.
				</p>
				<h2>Steps to Use the Mock Server:</h2>
				<h3>Determine the Service:</h3>
				<ul>
					<li>Identify whether you are interacting with BAP or BPP.</li>
				</ul>
				<h3>Identify the Action/On_Action:</h3>
				<ul>
					<li>Specify the action or on_action you intend to use.</li>
				</ul>
				<h3>Construct the URL:</h3>
				<ul>
					<li>
						Based on the service and action/on_action, construct the appropriate
						URL.
					</li>
				</ul>
				<h3>Select the Server:</h3>
				<ul>
					<li>
						For BPP requests, choose services (b2b, services,
						healthcare-services, agri-services)/bpp from the dropdown.
					</li>
					<li>
						For BAP requests, choose (b2b, services, healthcare-services,
						agri-services)/bap from the dropdown.
					</li>
				</ul>
				<h3>Ensure Readiness:</h3>
				<ul>
					<li>
						Have the Buyer Platform Provider (BPP) URL ready for using the mock
						server. This URL will be used to initiate requests.
					</li>
				</ul>

				<p>
					You can check the payload for that request from ONDC-SRV- link with
					select the particular service:{" "}
					<a href="https://ondc-official.github.io/ONDC-SRV-Specifications">
						https://ondc-official.github.io/ONDC-SRV-Specifications
					</a>
					.
				</p>

				<h2>Example Flow for BPP:</h2>
				<h3>Step 1: Enter the BPP URL</h3>
				<ul>
					<li>Navigate to the "Initiate Request" section on the right.</li>
					<li>Enter the BPP URL in the provided input field:</li>
					<ul>
						<li>
							Services:{" "}
							<a href="https://mock.ondc.org/api/services/bpp">
								https://mock.ondc.org/api/services/bpp
							</a>
						</li>
						<li>
							Retail:{" "}
							<a href="https://mock.ondc.org/api/retail/bpp">
								https://mock.ondc.org/api/retail/bpp
							</a>
						</li>
					</ul>
				</ul>
				<h3>Step 2: Select the Request Type for Search</h3>
				<img
					src={SearchRequest}
					alt="Search Request Type"
					style={{ width: "100%", maxWidth: "600px", margin: "20px 0" }}
				/>
				<p>
					Search intent sent by the buyer based on the particular health care
					service required - e.g., CBC.
				</p>
				<h3>Search request payload</h3>
				<ol>
					<li>
						Ensure that all required properties are present in the payload;
						otherwise, it returns a NACK.
						<Container maxWidth="lg">
							<div
								style={{
									whiteSpace: "pre-wrap",
									marginBottom: "10px",
									width: "90%",
									border: "1px solid #ccc",
									padding: "10px",
									borderRadius: "4px",
									backgroundColor: "#f4f4f4",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
								}}
							>
								<pre
									dangerouslySetInnerHTML={{
										__html: coloredJsonString({
											context: {
												domain: "ONDC:SRV13",
												location: {
													city: {
														code: "std:080",
													},
													country: {
														code: "IND",
													},
												},
												action: "search",
												version: "2.0.0",
												bap_id: "mock.ondc.org/api",
												bap_uri: "https://mock.ondc.org/api/services/bap",
												transaction_id: "0933f5c2-130c-4ce1-adcf-d9971c289611",
												message_id: "ec9badac-46c0-46d1-95fe-13096584275e",
												timestamp: "2024-06-18T08:01:52.263Z",
												ttl: "PT30S",
											},
											message: {
												intent: {
													item: {
														descriptor: {
															name: "LFT",
														},
													},
													fulfillment: {
														type: "Seller-Fulfilled",
														customer: {
															person: {
																name: "XYZ",
															},
															contact: {
																phone: "9999999999",
															},
														},
														stops: [
															{
																type: "end",
																time: {
																	range: {
																		start: "2024-04-04T22:00:00.000Z",
																	},
																},
																location: {
																	gps: "12.974002,77.613458",
																	area_code: "560001",
																},
															},
														],
													},
													payment: {
														type: "PRE-FULFILLMENT",
														collected_by: "BAP",
													},
													tags: [
														{
															descriptor: {
																code: "BAP_TERMS",
															},
															display: false,
															list: [
																{
																	descriptor: {
																		code: "FINDER_FEE_TYPE",
																	},
																	value: "percent",
																},
																{
																	descriptor: {
																		code: "FINDER_FEE_AMOUNT",
																	},
																	value: "0",
																},
															],
														},
													],
												},
											},
										}),
									}}
								/>
								<IconButton
									aria-label="Copy"
									onClick={() =>
										handleCopyText({
											context: {
												domain: "ONDC:SRV13",
												location: {
													city: {
														code: "std:080",
													},
													country: {
														code: "IND",
													},
												},
												action: "search",
												version: "2.0.0",
												bap_id: "buyerapp.com",
												bap_uri: "https://buyerapp.com/ondc",
												transaction_id: "T1",
												message_id: "M1",
												timestamp: "2024-04-01T22:00:00.000Z",
												ttl: "PT30S",
											},
											message: {
												intent: {
													item: {
														descriptor: {
															name: "LFT",
														},
													},
													fulfillment: {
														type: "Seller-Fulfilled",
														customer: {
															person: {
																name: "XYZ",
															},
															contact: {
																phone: "9999999999",
															},
														},
														stops: [
															{
																type: "end",
																time: {
																	range: {
																		start: "2024-04-04T22:00:00.000Z",
																	},
																},
																location: {
																	gps: "12.974002,77.613458",
																	area_code: "560001",
																},
															},
														],
													},
													payment: {
														type: "PRE-FULFILLMENT",
														collected_by: "BAP",
													},
													tags: [
														{
															descriptor: {
																code: "BAP_TERMS",
															},
															display: false,
															list: [
																{
																	descriptor: {
																		code: "FINDER_FEE_TYPE",
																	},
																	value: "percent",
																},
																{
																	descriptor: {
																		code: "FINDER_FEE_AMOUNT",
																	},
																	value: "0",
																},
															],
														},
													],
												},
											},
										})
									}
								>
									<FileCopyIcon />
								</IconButton>
							</div>
						</Container>
					</li>
				</ol>
				<h3>Response body</h3>
				<ol>
					<li>
						In the case of schema validation failure, you will receive a NACK. A
						sample NACK response is as below:
						<Container maxWidth="lg">
							<div
								style={{
									whiteSpace: "pre-wrap",
									marginBottom: "10px",
									width: "60%",
									border: "1px solid #ccc",
									padding: "10px",
									borderRadius: "4px",
									backgroundColor: "#f4f4f4",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
								}}
							>
								<pre
									dangerouslySetInnerHTML={{
										__html: coloredJsonString({
											message: {
												ack: {
													status: "NACK",
												},
											},
											error: {
												type: "JSON-SCHEMA-ERROR",
												code: "50009",
												message: [
													{
														message: "must have required property 'domain'",
													},
												],
											},
										}),
									}}
								/>
								<IconButton
									aria-label="Copy"
									onClick={() =>
										handleCopyText({
											message: {
												ack: {
													status: "NACK",
												},
											},
											error: {
												type: "JSON-SCHEMA-ERROR",
												code: "50009",
												message: [
													{
														message: "must have required property 'domain'",
													},
												],
											},
										})
									}
								>
									<FileCopyIcon />
								</IconButton>
							</div>
						</Container>
					</li>
					<li>
						In the case of schema validation success
						<Container maxWidth="lg">
							<div
								style={{
									whiteSpace: "pre-wrap",
									marginBottom: "10px",
									width: "60%",
									border: "1px solid #ccc",
									padding: "10px",
									borderRadius: "4px",
									backgroundColor: "#f4f4f4",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
								}}
							>
								<pre
									dangerouslySetInnerHTML={{
										__html: coloredJsonString({
											message: {
												ack: {
													status: "ACK",
												},
											},
										}),
									}}
								/>
								<IconButton
									aria-label="Copy"
									onClick={() =>
										handleCopyText({
											message: {
												ack: {
													status: "ACK",
												},
											},
										})
									}
								>
									<FileCopyIcon />
								</IconButton>
							</div>
						</Container>
					</li>
				</ol>
				<ul>
					<li>
						From the dropdown menu labeled "Initiate Request," select search.
					</li>
					<li>
						Choose the domain from the dropdown menu (e.g.,
						healthcare-services).
					</li>
					<li>
						Enter the appropriate city code in the provided field (e.g.,
						std:080).
					</li>
					<li>Click the blue "Send" button to initiate the search request.</li>
					<li>After processing, copy the received transaction_id.</li>
					<li>
						Paste the transaction_id into the "transaction analyze id" input
						field at Transaction Analyzer.
					</li>
					<li>
						Click "Submit" to analyze the transaction results based on the
						search request.
					</li>
					<li>On search returns the catalog specific to the search intent.</li>
					<li>Payload for search request.</li>
				</ul>
				<h3>Step 3: Selecting Items from the Search Results</h3>
				<img
					src={SelectRequest}
					alt="Search Request Type"
					style={{ width: "100%", maxWidth: "600px", margin: "20px 0" }}
				/>

				<p>
					Buyer selects the required health care service + suitable fulfillment
					type.
				</p>
				<ul>
					<li>Select from the "Initiate Request" dropdown.</li>
					<li>Enter the transaction_id from the search request.</li>
					<li>
						Click "Send" to initiate item selection based on the search results.
					</li>
					<li>
						On_select: Seller confirms the schedule and returns the quote for
						service.
					</li>
				</ul>
				<h3>Step 4: Initializing a Request with Billing Details</h3>
				<img
					src={InitRequest}
					alt="Search Request Type"
					style={{ width: "100%", maxWidth: "600px", margin: "20px 0" }}
				/>

				<p>Buyer initializes the order and provides billing details.</p>
				<ul>
					<li>Select init from the "Initiate Request" dropdown.</li>
					<li>Enter the transaction_id from previous requests.</li>
					<li>Click "Send" to initialize the request.</li>
					<li>
						Ensure you receive a confirmation message indicating successful
						initiation.
					</li>
					<li>On_init: Seller provides the final quotation.</li>
				</ul>
				<h3>Step 5: Confirm Request and Process Payment</h3>
				<img
					src={ConfirmRequest}
					alt="Search Request Type"
					style={{ width: "100%", maxWidth: "600px", margin: "20px 0" }}
				/>

				<p>Buyer makes the payment to confirm the order.</p>
				<ul>
					<li>Choose confirm from the "Initiate Request" dropdown.</li>
					<li>Enter the transaction_id from previous requests.</li>
					<li>Click "Send" to confirm the request and process payment.</li>
					<li>Review the "Sync Response" section for confirmation details.</li>
					<li>
						On_confirm: Seller app sends an on_confirm call to the buyer app
						accepting the order.
					</li>
				</ul>
				<h3>Step 6: Check Status of Booked Services</h3>
				<img
					src={StatusRequest}
					alt="Search Request Type"
					style={{ width: "100%", maxWidth: "600px", margin: "20px 0" }}
				/>

				<p>Buyer requests for the status of the order.</p>
				<ul>
					<li>Select on_status from the "Initiate Request" dropdown.</li>
					<li>Enter the transaction_id from previous requests.</li>
					<li>Click "Send" to check the current status of booked services.</li>
					<li>
						Review the "Sync Response" section for service status updates.
					</li>
					<li>
						On_status request call automatically after 30 seconds for all
						different status (for healthcare services e.g.:
						<ul>
							<li>
								In-transit: Seller app sends order status update when service
								provider is on the way.
							</li>
							<li>
								At-location: Seller app sends order status update when service
								provider has reached the buyer location.
							</li>
							<li>
								Collected-by-agent: Seller app sends the order status update
								when the sample has been collected by the service provider.
							</li>
							<li>
								Received-at-lab: Seller app sends the order status update when
								the sample has been received at the lab.
							</li>
							<li>
								Test-completed: Seller app sends the order status update when
								the test has been completed at the lab.
							</li>
							<li>
								Report Generated: Seller app sends the order status update when
								the test report is generated.
							</li>
							<li>
								Report Shared: Seller app sends the order status update when the
								test report is shared.
							</li>
						</ul>
					</li>
				</ul>
				<h3>Step 7: Update Selected Items and Quantity</h3>
				<img
					src={UpdateRequest}
					alt="Search Request Type"
					style={{ width: "100%", maxWidth: "600px", margin: "20px 0" }}
				/>

				<p>
					Buyer apps make a request for updating the number of items and
					quantity.
				</p>
				<ul>
					<li>Choose update from the "Initiate Request" dropdown.</li>
					<li>Enter the transaction_id from previous requests.</li>
					<li>Click "Send" to update selected items and quantities.</li>
					<li>Verify the update status in the "Sync Response" section.</li>
					<li>
						On_update: Seller app sends an on_update updating the payments
						object for the new payment to be collected and quote.
					</li>
				</ul>
				<h3>Step 8: Cancel Booked Services</h3>
				<p>
					Buyer requests for order cancellation and provides the cancellation
					reason_id.
				</p>
				<ul>
					<li>Select cancel from the "Initiate Request" dropdown.</li>
					<li>Enter the transaction_id from previous requests.</li>
					<li>
						Enter the cancellation_reason (e.g., "The user decided to cancel the
						booking").
					</li>
					<li>Click "Send" to cancel booked services.</li>
					<li>
						Confirm the cancellation message in the "Sync Response" section.
					</li>
					<li>On_confirm: Seller accepts the cancellation request.</li>
					<li>
						You can check the payload for that request from ONDC-SRV- link with
						select the particular service:{" "}
						<a href="https://ondc-official.github.io/ONDC-SRV-Specifications">
							https://ondc-official.github.io/ONDC-SRV-Specifications
						</a>
						.
					</li>
				</ul>

				<h2>Example Flow for BAP:</h2>
				<li>
					This guide explains how to use the ONDC Mock & Sandbox interface to
					interact with the Buyer App (BAP). The interface allows you to enter
					an authentication header and request body for different actions, such
					as search, select, init, confirm, status, and update.
				</li>
				<h3>Step 1: Enter the BAP URL and BAP Id</h3>
				<ul>
					<li>Navigate to the "Initiate Request" section on the left.</li>
					<li>Enter the BAP URL in the Request Payload:</li>
					<ul>
						<li>
							Services:{" "}
							<a href="https://mock.ondc.org/api/services/bap">
								https://mock.ondc.org/api/services/bap
							</a>
						</li>
						<li>
							B2B:{" "}
							<a href="https://mock.ondc.org/api/b2b/bap">
								https://mock.ondc.org/api/b2b/bap
							</a>
						</li>
						<li>
							B2C:{" "}
							<a href="https://mock.ondc.org/api/b2c/bap">
								https://mock.ondc.org/api/b2c/bap
							</a>
						</li>
					</ul>
				</ul>
				<img
					src={BapSearch}
					alt="Search Request Type"
					style={{ width: "100%", maxWidth: "600px", margin: "20px 0" }}
				/>

				<h2>Steps for Using the BAP Sandbox Interface</h2>
				<h3>Authentication Header</h3>
				<p>
					<strong>Purpose:</strong> To authenticate your requests to the BAP.
					<br />
					<p>
						To obtain the authentication header, please follow the{" "}
						<a href="https://mock.ondc.org/api/api-docs/auth/#/Auth/post_signature">
							Swagger link{" "}
						</a>
						provided and create an authentication header for all requests
						(search, select, init, confirm, update, status, cancel). Paste the
						request body here and include your private key: "your private key",
						"subscriber_id": "your subscribe id", and "unique_key_id": "your
						unique key". Update the request for all action calls accordingly.
					</p>
				</p>
				<h3>Request Body</h3>
				<p>
					<strong>Purpose:</strong> To specify the details of your request for
					different actions.
					<br />
					<strong>Structure:</strong> The request body varies depending on the
					action (e.g., search, select, init, confirm, status, update).
				</p>
				<h4>Example Actions</h4>
				<h5>Search</h5>
				<p>
					<strong>Action:</strong> search
					<br />
					<strong>Purpose:</strong> To initiate a search request.
					<br />
					<strong>Request Body Example:</strong>
					<br />
					<ol>
						<li>
							Ensure that all required properties are present in the payload;
							otherwise, it returns a NACK.
							<Container maxWidth="lg">
								<div
									style={{
										whiteSpace: "pre-wrap",
										marginBottom: "10px",
										width: "90%",
										border: "1px solid #ccc",
										padding: "10px",
										borderRadius: "4px",
										backgroundColor: "#f4f4f4",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-start",
									}}
								>
									<pre
										dangerouslySetInnerHTML={{
											__html: coloredJsonString({
												context: {
													domain: "ONDC:SRV13",
													location: {
														city: {
															code: "std:080",
														},
														country: {
															code: "IND",
														},
													},
													action: "search",
													version: "2.0.0",
													bap_id: "mock.ondc.org/api",
													bap_uri: "https://mock.ondc.org/api/services/bap",
													transaction_id:
														"0933f5c2-130c-4ce1-adcf-d9971c289611",
													message_id: "ec9badac-46c0-46d1-95fe-13096584275e",
													timestamp: "2024-06-18T08:01:52.263Z",
													ttl: "PT30S",
												},
												message: {
													intent: {
														item: {
															descriptor: {
																name: "LFT",
															},
														},
														fulfillment: {
															type: "Seller-Fulfilled",
															customer: {
																person: {
																	name: "XYZ",
																},
																contact: {
																	phone: "9999999999",
																},
															},
															stops: [
																{
																	type: "end",
																	time: {
																		range: {
																			start: "2024-04-04T22:00:00.000Z",
																		},
																	},
																	location: {
																		gps: "12.974002,77.613458",
																		area_code: "560001",
																	},
																},
															],
														},
														payment: {
															type: "PRE-FULFILLMENT",
															collected_by: "BAP",
														},
														tags: [
															{
																descriptor: {
																	code: "BAP_TERMS",
																},
																display: false,
																list: [
																	{
																		descriptor: {
																			code: "FINDER_FEE_TYPE",
																		},
																		value: "percent",
																	},
																	{
																		descriptor: {
																			code: "FINDER_FEE_AMOUNT",
																		},
																		value: "0",
																	},
																],
															},
														],
													},
												},
											}),
										}}
									/>
									<IconButton
										aria-label="Copy"
										onClick={() =>
											handleCopyText({
												context: {
													domain: "ONDC:SRV13",
													location: {
														city: {
															code: "std:080",
														},
														country: {
															code: "IND",
														},
													},
													action: "search",
													version: "2.0.0",
													bap_id: "buyerapp.com",
													bap_uri: "https://buyerapp.com/ondc",
													transaction_id: "T1",
													message_id: "M1",
													timestamp: "2024-04-01T22:00:00.000Z",
													ttl: "PT30S",
												},
												message: {
													intent: {
														item: {
															descriptor: {
																name: "LFT",
															},
														},
														fulfillment: {
															type: "Seller-Fulfilled",
															customer: {
																person: {
																	name: "XYZ",
																},
																contact: {
																	phone: "9999999999",
																},
															},
															stops: [
																{
																	type: "end",
																	time: {
																		range: {
																			start: "2024-04-04T22:00:00.000Z",
																		},
																	},
																	location: {
																		gps: "12.974002,77.613458",
																		area_code: "560001",
																	},
																},
															],
														},
														payment: {
															type: "PRE-FULFILLMENT",
															collected_by: "BAP",
														},
														tags: [
															{
																descriptor: {
																	code: "BAP_TERMS",
																},
																display: false,
																list: [
																	{
																		descriptor: {
																			code: "FINDER_FEE_TYPE",
																		},
																		value: "percent",
																	},
																	{
																		descriptor: {
																			code: "FINDER_FEE_AMOUNT",
																		},
																		value: "0",
																	},
																],
															},
														],
													},
												},
											})
										}
									>
										<FileCopyIcon />
									</IconButton>
								</div>
							</Container>
						</li>
					</ol>
					<h3>Response body</h3>
					<ol>
						<li>
							In the case of schema validation failure, you will receive a NACK.
							A sample NACK response is as below:
							<Container maxWidth="lg">
								<div
									style={{
										whiteSpace: "pre-wrap",
										marginBottom: "10px",
										width: "60%",
										border: "1px solid #ccc",
										padding: "10px",
										borderRadius: "4px",
										backgroundColor: "#f4f4f4",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-start",
									}}
								>
									<pre
										dangerouslySetInnerHTML={{
											__html: coloredJsonString({
												message: {
													ack: {
														status: "NACK",
													},
												},
												error: {
													type: "JSON-SCHEMA-ERROR",
													code: "50009",
													message: [
														{
															message: "must have required property 'domain'",
														},
													],
												},
											}),
										}}
									/>
									<IconButton
										aria-label="Copy"
										onClick={() =>
											handleCopyText({
												message: {
													ack: {
														status: "NACK",
													},
												},
												error: {
													type: "JSON-SCHEMA-ERROR",
													code: "50009",
													message: [
														{
															message: "must have required property 'domain'",
														},
													],
												},
											})
										}
									>
										<FileCopyIcon />
									</IconButton>
								</div>
							</Container>
						</li>
						<li>
							In the case of schema validation success
							<Container maxWidth="lg">
								<div
									style={{
										whiteSpace: "pre-wrap",
										marginBottom: "10px",
										width: "60%",
										border: "1px solid #ccc",
										padding: "10px",
										borderRadius: "4px",
										backgroundColor: "#f4f4f4",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-start",
									}}
								>
									<pre
										dangerouslySetInnerHTML={{
											__html: coloredJsonString({
												message: {
													ack: {
														status: "ACK",
													},
												},
											}),
										}}
									/>
									<IconButton
										aria-label="Copy"
										onClick={() =>
											handleCopyText({
												message: {
													ack: {
														status: "ACK",
													},
												},
											})
										}
									>
										<FileCopyIcon />
									</IconButton>
								</div>
							</Container>
						</li>
					</ol>
					<strong>Steps:</strong>
					<br />
					1. Enter the Authorization header.
					<br />
					2. Copy and paste the above JSON into the Request Body field.
					<br />
					3. Ensure the action search is detected as shown under Detected
					Action.( change the action according to requests for like (select,
					init, confirm, update, status,cancel ) with same transaction_id and
					different message request.
					<br />
					4. Click Submit.
				</p>
				<h2>Notes</h2>
				<ul>
					<li>
						Ensure that all IDs (e.g., item_id, order_id) are correctly
						referenced in each step.
					</li>
					<li>
						Replace placeholders such as your_bap_id, your_bap_uri, and
						your_token_here with actual values specific to your implementation.
					</li>
					<li>
						Use the provided "Submit" button to send requests and check the
						"Sync Response" section for acknowledgments.
					</li>
				</ul>

				<p>
					Please follow the same approach for all action calls by copying the
					request from the provided{" "}
					<a href="https://ondc-official.github.io/ONDC-SRV-Specifications">
						https://ondc-official.github.io/ONDC-SRV-Specifications
					</a>{" "}
					link and selecting the different services and action calls (select,
					init, confirm, update, status,cancel ). The documentation contains all
					the defined request payloads. Please ensure that your request payload,
					BAP ID, BAP URL, and authentication header created by you are correct
					according to the request payload you have pasted in the sandbox
					request body.
				</p>
				<h2>Analyzing Transactions after Requests</h2>
				<p>
					You can check the transaction analyser process from that link:{" "}
					<a href="https://mock.ondc.org/analyse">
						https://mock.ondc.org/analyse
					</a>
					.
				</p>

				<img
					src={TranslationAnalyser}
					alt="Search Request Type"
					style={{ width: "100%", maxWidth: "600px", margin: "20px 0" }}
				/>
				<h3>Step 1: Perform Necessary Requests</h3>
				<p>
					Perform various requests (search, select, init, confirm, status,
					update, cancel) as needed.
				</p>
				<h3>Step 2: Access the Transaction Analyzer Page</h3>
				<p>
					Navigate to the Transaction Analyzer page within the ONDC Mock &
					Sandbox environment.
				</p>
				<h3>Step 3: Enter the Transaction ID</h3>
				<ul>
					<li>
						Paste the transaction_id into the "Enter Transaction ID" field.
					</li>
					<li>
						Click the refresh or submit button to fetch transaction details.
					</li>
				</ul>
				<h3>Step 4: View the Analysis</h3>
				<p>Visual Representation:</p>
				<ul>
					<li>
						View a visual flow of the transaction lifecycle with actions like
						search, select, init, confirm, on_status, update, cancel.
					</li>
					<li>
						Arrows indicate interactions between Buyer App Node and Seller App
						Node.
					</li>
				</ul>
				<p>Inspect Payloads:</p>
				<ul>
					<li>
						Click action boxes (e.g., confirm, on_confirm, status, on_status) to
						view JSON data exchanged.
					</li>
				</ul>
				<p>Check for Errors and Status:</p>
				<ul>
					<li>
						Review each action's status for successful processing or error
						messages.
					</li>
				</ul>
				<h3>Example Scenario</h3>
				<h4>Analyzing a Search Request</h4>
				<ul>
					<li>
						Search Request Action: Details of the search request sent by the
						Buyer App Node.
					</li>
					<li>
						on_search Response: Response from the Seller App Node based on the
						search request.
					</li>
				</ul>
				<h4>Analyzing a Select Request</h4>
				<ul>
					<li>
						Select Request Action: Details of the select request sent by the
						Buyer App Node.
					</li>
					<li>
						on_select Response: Response from the Seller App Node based on
						selected items and return payment quote.
					</li>
				</ul>
				<h4>Analyzing an Init Request</h4>
				<ul>
					<li>
						Init Request Action: Details of the init request sent by the Buyer
						App Node with billing address.
					</li>
					<li>
						on_init Response: Response from the Seller App Node confirming the
						order.
					</li>
				</ul>
				<h4>Analyzing a Confirm Request</h4>
				<ul>
					<li>
						Confirm Request Action: Details of the confirm request sent by the
						Buyer App Node.
					</li>
					<li>
						on_confirm Response: Response from the Seller App Node confirming
						the order.
					</li>
				</ul>
				<h4>Analyzing a Status Check</h4>
				<ul>
					<li>
						Status Request Action: Current status of the order from the Seller
						App Node.
					</li>
				</ul>
				<h4>Analyzing an Update Request</h4>
				<ul>
					<li>
						Update Request Action: Details of the update request sent by the
						Buyer App Node.
					</li>
					<li>
						on_update Response: Response from the Seller App Node confirming the
						update.
					</li>
				</ul>
				<h4>Analyzing a Cancellation Request</h4>
				<ul>
					<li>
						Cancel Request Action: Details of the cancel request sent by the
						Buyer App Node, including reason.
					</li>
					<li>
						on_cancel Response: Response from the Seller App Node confirming the
						cancellation.
					</li>
				</ul>
				<p>
					By following these steps, you can effectively navigate and analyze
					transactions within the ONDC Mock & Sandbox environment for all
					services. Ensure accuracy in all entered information for successful
					processing.
				</p>
			</div>
		</Container>
	);
};

export default ONDCDocumentation;

{
	/* <div>
				<h1>ONDC Mock & Sandbox</h1>
				<p>
					To facilitate the development and testing of Buyer Network
					participants or Seller network participants. It provides a simulated
					environment where developers can test, and validate their integrations
					without the need for a counterparty network participant.
				</p>

				<h2 style={{ borderBottom: "1px solid #e0e0e0", paddingBottom: "8px" }}>
					How to use
				</h2>
				<p>
					To start, first you have to ask yourself two things. "To which service
					I am making requests to(BAP or BPP)?" and "what would be the
					action/on_action I am going to use". With these you can easily
					construct the URL you need to mock and then find that among this list.
				</p>
				<i>NOTE: Currently mocker server supports only B2B and Services.</i>
				{/* Add more details about the mock server */
}

// <h2 style={{ borderBottom: "1px solid #e0e0e0", paddingBottom: "8px" }}>
// 	Steps to Run:
// </h2>
// <p>
// 	There are 2 domains that you can test.
// 	<ol>
// 		<li>B2B</li>
// 		<li>Services( Home Services, Agri Services, Healthcare Services)</li>
// 	</ol>
// 	<h4>
// 		To start testing your buyer or seller application , follow these
// 		steps:{" "}
// 	</h4>
// 	<ol>
// 		<li>
// 			Select Domain Type:
// 			<ul>
// 				<li>
// 					From the navigation menu, choose the type of domain you want
// 					to test.
// 				</li>
// 			</ul>
// 		</li>
// 		<li>
// 			Choose Service Type:
// 			<ul>
// 				<li>Select the specific service you want to avail.</li>
// 			</ul>
// 		</li>
// 		<li>
// 			If you want to initiate Seller Testing:
// 			<ul>
// 				<li>
// 					You have two options for initiating seller testing:
// 					<ul>
// 						<li>
// 							<b>From Sandbox:</b> Initiate the request directly from
// 							the sandbox environment.
// 						</li>
// 						<li>
// 							<b>Upload Payload:</b> Alternatively, you can upload your
// 							own payload for testing.
// 						</li>
// 					</ul>
// 				</li>
// 			</ul>
// 		</li>
// 		<li>
// 			Analyze Transaction: :
// 			<ul>
// 				<li>Copy the transaction ID provided.</li>
// 				<li>
// 					Paste the transaction ID into the Transaction Analyzer
// 					section.
// 				</li>
// 				<li>
// 					Here, you can visualize the complete flow and view the
// 					payloads with their validation checks.
// 				</li>
// 			</ul>
// 		</li>
// 	</ol>
// </p>
{
	/* Add more details about the sandbox */
}

// <h2 style={{ borderBottom: "1px solid #e0e0e0", paddingBottom: "8px" }}>
// 	Servers
// </h2>
// <p>
// 	There are two type of NPs one is BPP(Seller app) and BAP(Buyer app).
// </p>
// <ul>
// 	<li>
// 		All the actions calls are hosted on the BPP server. So if you want
// 		to make mock requests to BPP, then select /b2b/bpp from the servers
// 		dropdown.
// 	</li>
// 	<li>
// 		All the on_actions calls are hosted on the BAP server. So if you
// 		want make mock requests to BAP or the buyer app, then select
// 		/b2b/bap from the servers dropdown.
// 	</li>
// </ul>
{
	/* Add more details about using Swagger */
}
// <h2 style={{ borderBottom: "1px solid #e0e0e0", paddingBottom: "8px" }}>
// 	Make a request
// </h2>
// <p>
// 	Since you have selected the desired server, now you can make the
// 	requests to that server. There are two serivces available to test with
// 	:
// </p>
// <ul>
// 	<li>SandBox</li>
// 	<li>Mock</li>
// </ul>
// <p>You can select service from mode dropdown.</p>
// <h3>Sandbox</h3>
// <p>
// 	To use the sandbox you need to have an authorization header which is
// 	to be passed in the header to make requests. For creating the
// 	authorization header you can refer this{" "}
// 	<a href="https://docs.google.com/document/d/1brvcltG_DagZ3kGr1ZZQk4hG4tze3zvcxmGV4NMTzr8/edit?pli=1#heading=h.hdylqyv4bn12">
// 		document
// 	</a>{" "}
// </p>
// <h3>Mock</h3>
// <p>
// 	You can use Mock service to mock the requests. It doesn't require
// 	authorization header to be passed.
// </p>
// <h3>Request body</h3>
// <p>You can refer these examples for request body.</p>
// <p>
// 	Note: All the requests must pass the schema validation based on the
// 	examples. You can refer this log utility for the schema validations.
// </p>
// <h3>Response body</h3>
// <ol>
// 	<li>
// 		In the case of schema validation failure, you will receive a NACK. A
// 		sample NACK response is as below:
// 		<Container maxWidth="lg">
// 			<div
// 				style={{
// 					whiteSpace: "pre-wrap",
// 					marginBottom: "10px",
// 					width: "60%",
// 					border: "1px solid #ccc",
// 					padding: "10px",
// 					borderRadius: "4px",
// 					backgroundColor: "#f4f4f4",
// 					display: "flex",
// 					justifyContent: "space-between",
// 					alignItems: "flex-start",
// 				}}
// 			>
// 				<pre
// 					dangerouslySetInnerHTML={{
// 						__html: coloredJsonString({
// 							message: {
// 								ack: {
// 									status: "NACK",
// 								},
// 							},
// 							error: {
// 								type: "JSON-SCHEMA-ERROR",
// 								code: "50009",
// 								message: [
// 									{
// 										message: "must have required property 'domain'",
// 									},
// 								],
// 							},
// 						}),
// 					}}
// 				/>
// 				<IconButton
// 					aria-label="Copy"
// 					onClick={() =>
// 						handleCopyText({
// 							message: {
// 								ack: {
// 									status: "NACK",
// 								},
// 							},
// 							error: {
// 								type: "JSON-SCHEMA-ERROR",
// 								code: "50009",
// 								message: [
// 									{
// 										message: "must have required property 'domain'",
// 									},
// 								],
// 							},
// 						})
// 					}
// 				>
// 					<FileCopyIcon />
// 				</IconButton>
// 			</div>
// 		</Container>
// 	</li>
// 	<li>
// 		In the case of schema validation success
// 		<Container maxWidth="lg">
// 			<div
// 				style={{
// 					whiteSpace: "pre-wrap",
// 					marginBottom: "10px",
// 					width: "60%",
// 					border: "1px solid #ccc",
// 					padding: "10px",
// 					borderRadius: "4px",
// 					backgroundColor: "#f4f4f4",
// 					display: "flex",
// 					justifyContent: "space-between",
// 					alignItems: "flex-start",
// 				}}
// 			>
// 				<pre
// 					dangerouslySetInnerHTML={{
// 						__html: coloredJsonString({
// 							message: {
// 								ack: {
// 									status: "ACK",
// 								},
// 							},
// 						}),
// 					}}
// 				/>
// 				<IconButton
// 					aria-label="Copy"
// 					onClick={() =>
// 						handleCopyText({
// 							message: {
// 								ack: {
// 									status: "ACK",
// 								},
// 							},
// 						})
// 					}
// 				>
// 					<FileCopyIcon />
// 				</IconButton>
// 			</div>
// 		</Container>
// 	</li>
// </ol>
{
	/* Add more details about using Swagger */
}
// <h2 style={{ borderBottom: "1px solid #e0e0e0", paddingBottom: "8px" }}>
// 	CURL request
// </h2>
// <p>
// 	You can also make curl to directly make requests to sandbox
// 	environments.
// </p>
// <p>
// 	Curl host for Buyer instance: https://mock.ondc.org/api/b2b/bap
// </p>
// <p>
// 	Curl host for Seller instance: https://mock.ondc.org/api/b2b/bpp
// </p>
{
	/* Add more details about using Swagger */
}
// </div> */}
