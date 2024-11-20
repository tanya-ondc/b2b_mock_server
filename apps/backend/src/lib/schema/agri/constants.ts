export const VERSION = "1.2.0";

export const DOMAIN = ["ONDC:AGR11","ONDC:AGR10"];

export const SRV_FULFILLMENT_TYPE = ["Home-Service", "Store-Service","Seller-Fulfilled", "Buyer-Fulfilled"];

export const SRV_INTENT_TAGS = ["finder_fee_type","finder_fee_amount","FINDER_FEE_TYPE","FINDER_FEE_AMOUNT","BAP_TYPE","BAP_Terms","BAP_TERMS","BAP_DETAILS","BUYER_ID_CODE","BUYER_ID_NO","BUYER_ID"];

export const SRV_PAYMENT_TYPE = [
	"PRE-FULFILLMENT",
	"ON-FULFILLMENT",
	"POST-FULFILLMENT",
];

export const SRV_FULFILLMENT_STATE = [
	"IN_TRANSIT",
	"AT_LOCATION",
	"COLLECTED_BY_AGENT",
	"RECEIVED_AT_LAB",
	"TEST_COMPLETED",
	"REPORT_GENERATED",
	"REPORT_SHARED",
	"COMPLETED",
	"Placed",
	"cancel"
];

export const SRV_ORDER_STATE = [
	"Created",
	"Accepted",
	"In-progress",
	"Completed",
	"Cancelled",
	"COMPLETED",
	"Pending",
];
 
export const AGRI_INPUT_STATE=[
	"ACCEPTED",
	"IN-PROGRESS",
	"COMPLETED"
]

export const AGRI_FULFILLMENT_STATE=[
	"CREATED",
	"PACKED",
	"AGENT_ASSIGNED",
	"ORDER_PICKED_UP",
	"OUT_FOR_DELIVERY",
	"DELIVERED"
]
export const GPS_PATTERN =
	"^(-?[0-9]{1,3}(?:.[0-9]{6,15})?),( )*?(-?[0-9]{1,3}(?:.[0-9]{6,15})?)$";

export const SERVICEABILITY = ["location", "category", "type", "val", "unit"];

export const RESCHEDULE_TERMS = [
	"fulfillment_state",
	"reschedule_eligible",
	"reschedule_fee",
	"reschedule_within",
];

export const PAYMENT_COLLECTEDBY = ["BAP", "BPP"];
