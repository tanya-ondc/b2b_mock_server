export const HOUR24 = 24 * 60 * 60 * 1000;
const MOCK_API_BASE_URL = process.env?.MOCK_API_BASE_URL
	? process.env.MOCK_API_BASE_URL
	: "http://localhost:3005/api/";

export const REGISTRY_URL = "https://staging.registry.ondc.org/lookup";
// export const REGISTRY_URL = "https://preprod.registry.ondc.org/ondc/lookup";

export const SERVICES_EXAMPLES_PATH =
	"./domain-repos/@services/draft-services/api/components/Examples/Services_home_service_yaml";

export const AGRI_SERVICES_EXAMPLES_PATH =
	"./domain-repos/@services/draft-agri-services/api/components/Examples/Agriculture_services_yaml";

export const BID_AUCTION_SERVICES_EXAMPLES_PATH =
	"./domain-repos/@services/draft-agri_bids_and_auction/api/components/Examples/Agri_Bids_And_Auction_yaml";

export const HEALTHCARE_SERVICES_EXAMPLES_PATH =
	"./domain-repos/@services/draft-healthcare-service/api/components/Examples/Health_care_services_yaml";

export const AGRI_EQUIPMENT_HIRING_EXAMPLES_PATH =
	"./domain-repos/@services/draft-agri_equipment/api/components/Examples/Agri_Equipment_Hiring_yaml";

export const B2B_EXAMPLES_PATH =
	"./domain-repos/@retail-b2b/release-2.0.2/api/components/Examples/B2B";
export const B2C_EXAMPLES_PATH =
	"./domain-repos/@retail-b2b/b2c_exports_2.0/api/components/Examples/B2C_Exports";

export const LOGISTICS_EXAMPLES_PATH =
	"./domain-repos/@logistics/draft-2.x/api/components/Examples";

export const SUBSCRIPTION_EXAMPLES_PATH =
	"./domain-repos/@mec/draft-print_media/api/components/Examples/Print_Content_yaml";

export const MOCKSERVER_ID = "mock.ondc.org/api";
// export const B2B_BPP_MOCKSERVER_URL = `https://${MOCKSERVER_ID}/b2b/bpp`;
// export const B2B_BAP_MOCKSERVER_URL = `https://${MOCKSERVER_ID}/b2b/bap`;
export const B2B_BPP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}b2b/bpp`;
export const B2B_BAP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}b2b/bap`;
export const B2C_BPP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}b2c/bpp`;
export const B2C_BAP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}b2c/bap`;

export const REATIL_BPP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}retail/bpp`;
export const RETAIL_BAP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}retail/bap`;

export const LOGISTICS_BPP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}logistics/bpp`;
export const LOGISTICS_BAP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}logistics/bap`;
// export const SERVICES_BPP_MOCKSERVER_URL = `https://${MOCKSERVER_ID}/services/bpp`;
// export const SERVICES_BAP_MOCKSERVER_URL = `https://${MOCKSERVER_ID}/services/bap`;
export const SERVICES_BPP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}services/bpp`;
export const SERVICES_BAP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}services/bap`;

export const AGRI_SERVICES_BPP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}agri-services/bpp`;
export const AGRI_SERVICES_BAP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}agri-services/bap`;
// export const AGRI_SERVICES_BPP_MOCKSERVER_URL = `https://${MOCKSERVER_ID}/agri-services/bpp`;
// export const AGRI_SERVICES_BAP_MOCKSERVER_URL = `https://${MOCKSERVER_ID}/agri-services/bap`;

export const HEALTHCARE_SERVICES_BPP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}healthcare-services/bpp`;
export const HEALTHCARE_SERVICES_BAP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}healthcare-services/bap`;

export const AGRI_EQUIPMENT_BPP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}agri-equipment-hiring/bpp`;
export const AGRI_EQUIPMENT_BAP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}agri-equipment-hiring/bap`;

// export const HEALTHCARE_SERVICES_BPP_MOCKSERVER_URL = `https://${MOCKSERVER_ID}/healthcare-services/bpp`;
// export const HEALTHCARE_SERVICES_BAP_MOCKSERVER_URL = `https://${MOCKSERVER_ID}/healthcare-services/bap`;

export const SUBSCRIPTION_BPP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}subscription/bpp`;
export const SUBSCRIPTION_BAP_MOCKSERVER_URL = `${MOCK_API_BASE_URL}subscription/bap`;
