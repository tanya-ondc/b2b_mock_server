import { B2B_SCENARIOS, PRINT_MEDIA_SCENARIOS } from "openapi-specs/constants";

export const SUPPORTED_DOMAINS = [
	"B2B",
	"B2C Exports",
	"SERVICES",
	"AGRI SERVICES",
	"HEALTHCARE SERVICES",
	"AGRI EQUIPMENT HIRING",
	"BID AND AUCTION",
	"LOGISTICS",
	"PRINT MEDIA (SUBSCRIPTION)"
];

export const USER_GUIDE_LINK =
	"https://github.com/tanyamadaan/b2b_mock_server/blob/feat-monorepo/README.md";

export const SWAGGER_BUILD_LINK =
	"https://raw.githubusercontent.com/abhik-wil/b2b_mock_server/feat-monorepo/apps/backend/src/openapi/build/swagger.yaml";

export const URL_MAPPING = {
	bpp: ["search", "select", "init", "confirm", "update", "status", "cancel"],
	bap: [
		"on_search",
		"on_select",
		"on_init",
		"on_confirm",
		"on_update",
		"on_status",
		"on_cancel",
	],
};

export const ACTION_PRECENDENCE = [
	"search",
	"on_search",
	"select",
	"on_select",
	"init",
	"on_init",
	"confirm",
	"on_confirm",
	"status",
	"on_status",
	"update",
	"on_update",
	"cancel",
	"on_cancel",
];

export const B2B_DOMAINS = [
	"ONDC:RET1A",
	"ONDC:RET1B",
	"ONDC:RET1C",
	"ONDC:RET1D",
	"ONDC:RET10",
	"ONDC:RET12",
	"ONDC:RET13",
	"ONDC:RET14",
];

export const LOGISTICS_DOMAINS_OBJECT = {
	DOMESTIC: "ONDC:LOG10",
	INTERNATIONAL: "ONDC:LOG11",
};

export const LOGISTICS_DOMAINS = ["ONDC:LOG10", "ONDC:LOG11"];

export const AGRI_DOMAINS = ["ONDC:AGR10", "ONDC:AGR11"];
export const B2C_DOMAINS = ["ONDC:RET10", "ONDC:RET12"];

export const SERVICE_DOMAINS = [
	"ONDC:SRV11",
	"ONDC:SRV13",
	"ONDC:SRV14",
	"ONDC:SRV17",
	"ONDC:SRV18",
];

export const SUBSCRIPTION_DOMAINS = [
	"ONDC:MEC10"
]

export const RETAIL_DOMAINS = ["b2b", "b2c"];

export const SERVICE_DOMAINS_OBJECT = [
	{ lable: "ONDC:SRV11-Services", value: "ONDC:SRV11" },
	{ lable: "ONDC:SRV13-Healthcare Services", value: "ONDC:SRV13" },
	{ lable: "ONDC:SRV14-Agri Services", value: "ONDC:SRV14" },
	{ lable: "ONDC:SRV17-Agri Equipment Hiring Services", value: "ONDC:SRV17" },
	{ lable: "ONDC:SRV18-Bid And Auction Services", value: "ONDC:SRV18" },
];

export const SERVICES_DOMAINS = {
	SERVICE: "ONDC:SRV11",
	HEALTHCARE_SERVICES: "ONDC:SRV13",
	AGRI_SERVICES: "ONDC:SRV14",
	EQUIPMENT_HIRING_SERVICES: "ONDC:SRV17",
	BID_AUCTION_SERVICE: "ONDC:SRV18",
	PRINT_MEDIA: "ONDC:MEC10"
};

export const ALL_DOMAINS = {
	Retail: RETAIL_DOMAINS,
	Services: SERVICE_DOMAINS,
	Subscription: SUBSCRIPTION_DOMAINS,
	Logistics: LOGISTICS_DOMAINS,
	Agri: AGRI_DOMAINS,
};

export const CITY_CODE = ["std:080", "std:011", "std:999"];
export const AGRI_SCENARIOS = {
  search: [
    {
      name: "Default",
      scenario: "default",
    },
    {
      name: "Incremental Pull.",
      scenario: "incremental-pull", // Select Domestic
    },
  ],
  on_search: [
    {
      name: "Default",
      scenario: "default",
    },
    {
      name: "Incremental Pull.",
      scenario: "incremental-pull", // Select Domestic
    },
  ],
  select: [
    {
      name: "Default",
      scenario: "default",
    },
    {
      name: "Multi Items Successfull Order",
      scenario: "multi-items-successfull-order",
    },
  ],
  on_select: [
    {
      name: "Default",
      scenario: "default",
    },
    {
      name: "Multi Items Successfull Order",
      scenario: "multi-items-successfull-order",
    },
    {
      name: "Item_Out_Of_Stock",
      scenario: "item-out-of-stock",
    },
  ],
  on_status: [
    {
      name: "Default",
      scenario: "default",
    },
    {
      name: "Accepted",
      scenario: "accepted",
    },
    {
      name: "Packed",
      scenario: "packed",
    },
    {
      name: "Agent Assigned",
      scenario: "agent-assigned",
    },
    {
      name: "Order Picked Up",
      scenario: "order-picked-up",
    },
    {
      name: "Out for Delivery",
      scenario: "out-for-delivery",
    },
    {
      name: "Delivery",
      scenario: "delivery",
    },
  ],
  update: [
    // {
    //  name:"update-items",
    //  scenario:"items"
    // },
    {
      name: "liquidate",
      scenario: "liquidate",
    },
    {
      name: "Reject",
      scenario: "reject",
    },
  ],
  on_update: [
    {
      name: "Default",
      scenario: "default",
    },
    {
      name: "Reject",
      scenario: "reject", 
    },
  ],
};
// export const AGRI_OUTPUT_SCENARIOS = {
//   search: [
//     {
//       name: "Default",
//       scenario: "default",
//     },
//     {
//       name: "Interval Pull",
//       scenario: "interval-pull", 
//     },
// 		{
// 			name:"Start",
// 			scenario:"start"
// 		}
//   ],
//   on_search: [
//     {
//       name: "Default",
//       scenario: "default",
//     },
//     {
//       name: "Push By Seller ",
//       scenario: "push-by-seller", 
//     },
//   ],
//   select: [
//     {
//       name: "Default",
//       scenario: "default",
//     },
//     {
//       name: "Counter Offers",
//       scenario: "counter-offers",
//     },
// 		{
// 			name:"Accepts",
// 			scenario:"accepts"
// 		}
//   ],
//   on_select: [
//     {
//       name: "Default",
//       scenario: "default",
//     },
//     {
//       name: "Reject",
//       scenario: "reject",
//     },
//     {
//       name: "Counter-Offers",
//       scenario: "counter-offers",
//     },
// 		{
//       name: "Accepts",
//       scenario: "accepts",
//     },
//   ],
// 	init:[
// 		{
// 			name:"Default",
// 			scenario:"default"
// 		},
// 		{
// 			name:"Participation Fee",
// 			scenario:"participation-fee"
// 		},
// 		{
// 			name:"Bid Placement",
// 			scenario:"bid-placement"
// 		}
// 	],
// 	on_init:[
// 			{
// 				name:"Default",
// 				scenario:"default"
// 			},
// 			{
// 				name:"Participation Fee",
// 				scenario:"participation-fee"
// 			},
// 			{
// 				name:"Bid Placement",
// 				scenario:"bid-placement"
// 			}
// 	],
//   on_status: [
//     {
//       name: "Default",
//       scenario: "default",
//     },
//     {
//       name: "Payment Confirmation",
//       scenario: "payment-confirmation",
//     },
//     {
//       name: "Packed",
//       scenario: "packed",
//     },
//     {
//       name: "Agent Assigned",
//       scenario: "agent-assigned",
//     },
//     {
//       name: "Order Picked Up",
//       scenario: "order-picked-up",
//     },
//     {
//       name: "Out for Delivery",
//       scenario: "out-for-delivery",
//     },
//     {
//       name: "Delivery",
//       scenario: "delivery",
//     },
//   ],
//   update: [
//     {
//      name:"Re Negotiate",
//      scenario:"re-negotiate"
//     },
//     {
//       name: "Increase Bids Price ",
//       scenario: "increase-bids-price",
//     },
//     {
//       name: "Awarded",
//       scenario: "awarded",
//     },
//   ],
//   on_update: [
//     {
//       name: "Default",
//       scenario: "default",
//     },
//     {
//       name: "Reject",
//       scenario: "reject", 
//     },
// 		{
//       name: "Not Awarded",
//       scenario: "not-awarded",
//     },
//   ],
// 	cancel:[
// 		{name:"Default",
// 			scenario:"default"
// 		},
// 		{
// 			name:"Not Satisfied",
// 			scenario:"not-satisfied"
// 		}
// 	]
// };
export const B2C_CITY_CODE = ["UN:SIN"];
export const INITIATE_FIELDS = {
	search: [
		{
			name: "bpp_uri",
			placeholder: "Enter Your BPP URI",
			type: "text",
		},

		//DEPEND ON SERVICES AND RETAILS
		{
			name: "version",
			placeholder: "Select Use Case...",
			type: "select",
			domainDepended: true,
			options: {
				retail: RETAIL_DOMAINS,
				b2b: RETAIL_DOMAINS,
				b2c: RETAIL_DOMAINS,
			},
		},

		//DEPEND ON SELECTED SERVICES
		{
			name: "domain",
			placeholder: "Select Domain...",
			type: "select",
			domainDepended: true,
			options: {
				retail: B2B_DOMAINS,
				b2b: B2B_DOMAINS,
				services: SERVICE_DOMAINS,
				subscription: SUBSCRIPTION_DOMAINS,
				// services:SERVICE_DOMAINS_OBJECT,
				b2c: B2C_DOMAINS,
				logistics: LOGISTICS_DOMAINS,
				agri: AGRI_DOMAINS,
			},
		},
		//DEPENDS ON DOMAIN B2B LOGISTICS
		{
			name: "deliveryType",
			placeholder: "Select Delivery Type...",
			type: "select",
			domainDepended: true,
			options: {
				logistics: [],
			},
		},


		{
			name: "city",
			placeholder: "Select A City",
			type: "select",
			domainDepended: true,
			options: {
				retail: CITY_CODE,
				b2b: CITY_CODE,
				services: CITY_CODE,
				subscription: CITY_CODE,
				b2c: B2C_CITY_CODE,
				agri: CITY_CODE,
				agrioutput:CITY_CODE,
				logistics: [],
			},
		},
		{
			name: "scenario",
			placeholder: "Select Scenario",
			type: "select",
			domainDepended: true,
			options: {
				agri: AGRI_SCENARIOS["search"].map((each) => each.scenario),
				// agrioutput:AGRI_OUTPUT_SCENARIOS["search"].map((each)=>each.scenario)
			},
		},
	],

	select: [
		{
			name: "transactionId",
			placeholder: "Enter Your Transaction ID",
			type: "text",
		},
		{
			name: "scenario",
			placeholder: "Select Scenario",
			type: "select",
			domainDepended: true,
			options: {
				retail: B2B_SCENARIOS["select"].map((each) => each.scenario),
				subscription: PRINT_MEDIA_SCENARIOS["select"].map((each) => each.scenario),
				b2b: B2B_SCENARIOS["select"].map((each) => each.scenario),
				agri: AGRI_SCENARIOS["select"].map((each) => each.scenario),
				// agrioutput:AGRI_OUTPUT_SCENARIOS["select"].map((each)=>each.scenario)
			},
		},
	],

	init: [
		{
			name: "transactionId",
			placeholder: "Enter Your Transaction ID",
			type: "text",
		},
		{
			name: "scenario",
			placeholder: "Select Scenario",
			type: "select",
			domainDepended: true,
			options: {
				retail: B2B_SCENARIOS["init"].map((each) => each.scenario),
				// subscription:PRINT_MEDIA_SCENARIOS["init"].map((each) => each.scenario),
				// agrioutput:AGRI_OUTPUT_SCENARIOS["init"].map((each)=>each.scenario),
				b2b: B2B_SCENARIOS["init"].map((each) => each.scenario),
				b2c:["prepaid-bpp-payment"]
				// retail: B2B_SCENARIOS["init"].map((each) => each.scenario),
				// services: SERVICES_SCENARIOS["init"].map((each) => each.scenario),
			},
		},
	],

	confirm: [
		{
			name: "transactionId",
			placeholder: "Enter Your Transaction ID",
			type: "text",
		},
		{
			name: "scenario",
			placeholder: "Select Scenario",
			type: "select",
			domainDepended: true,
			options: {
				// services: SERVICES_SCENARIOS["confirm"].map((each) => each.scenario),
			},
		},
	],

	status: [
		{
			name: "transactionId",
			placeholder: "Enter Your Transaction ID",
			type: "text",
		},
		{
			name: "scenario",
			placeholder: "Select Scenario",
			type: "select",
			domainDepended: true,
			options: {
				// services: SERVICES_SCENARIOS["confirm"].map((each) => each.scenario),
			},
		},
	],

	update: [
		{
			name: "transactionId",
			placeholder: "Enter Your Transaction ID",
			type: "text",
		},
		{
			name: "update_target",
			placeholder: "Update Target",
			type: "select",
			domainDepended: true,
			options: {
				services: ["payments", "fulfillments", "items"],
				b2b: ["payments", "fulfillments", "items"],
				b2c: ["payments", "fulfillments", "items"],
				logistics: ["fulfillments"],
				retail:["payments"],
				agri: AGRI_SCENARIOS["update"].map((each) => each.scenario),
				// agrioutput:AGRI_OUTPUT_SCENARIOS["update"].map((each)=>each.scenario)
			},
		},
	],

	cancel: [
		{
			name: "transactionId",
			placeholder: "Enter Your Transaction ID",
			type: "text",
		},
		{
			name: "orderId",
			placeholder: "Enter Your Order ID",
			type: "text",
		},
		{
			name: "cancellationReasonId",
			placeholder: "Enter Your Cancellation Reason ID",
			type: "text",
			domainDepended: true,
			options: {
				services: ["001"],
				b2b: ["001"],
				b2c: ["001"],
				retail: ["001"],
				subscription: ["001"],
				logistics: ["TAT Breach, 007"],
				agri: ["010"] 

			},
		},
		{
			name: "scenario",
			placeholder: "Select Scenario",
			type: "select",
			domainDepended: true,
			options: {
				// agrioutput:AGRI_OUTPUT_SCENARIOS["cancel"].map((each)=>each.scenario)
				// services: SERVICES_SCENARIOS["confirm"].map((each) => each.scenario),
			},
		},
	],
};

export const SWAGGER_DOMAIN_FIELDS = {
	name: "service_name",
	placeholder: "Select Service...",
	type: "select",
	domainDepended: false,
	options: ALL_DOMAINS,
};
