export interface SettlementDetails {
    settlement_counterparty: string;
    settlement_phase: string;
    beneficiary_name: string;
    settlement_reference?: string;
    settlement_status?: string;
    settlement_timestamp?: string;
    settlement_type?: string;
    upi_address?: string;
    settlement_bank_account_no?: string;
    settlement_ifsc_code?: string;
    bank_name?: string;
    branch_name?: string;
}
interface Price {
  currency: string;
  value: string;
  offered_value?: string;
  maximum_value?: string;
}
export interface Descriptor {
  code: string;
}
export interface Time {
  range: {
    start: string;
    end: string;
  };
  days?: string;
  label?: string;
  timestamp?:string
}
interface AddOn {
  id: string;
}
export interface TagItem {
  descriptor: Descriptor;
  value: string; // Assuming value is always a string. Adjust the type if it can be different.
}

export interface Tag {
  descriptor: Descriptor;
  list: TagItem[];
}
interface Media {
  mimetype: string;
  url: string;
}

interface Image {
  url: string;
}
interface Measure {
  unit: string;
  value: string;
}

interface QuantityDetail {
  measure: Measure;
  count?: number;
}

export type Quantity= {
  unitized: {measure:Measure};
  available: QuantityDetail;
  maximum: QuantityDetail;
  minimum: QuantityDetail;
}
export type Select={
  selected: {
    count: number;
  }
}

export interface TimeObject {
  label: string;
  duration: string;
  timestamp: string;
}

interface ItemDescriptor {
  name: string;
  code: string;
  short_desc: string;
  long_desc: string;
  images: Image[];
  media: Media[];
}
export interface Item {
  id: string;
  location_ids: string[];
  fulfillment_ids: string[];
  quantity: Select|Quantity;
  add_ons?: AddOn[]; // Optional because not all items have add_ons
  parent_item_id?: string; // Optional because not all items have a parent_item_id
  category_ids?: string[]; // Optional because not all items have category_ids
  tags?: Tag[]; // Optional because not all items have tags
  descriptor?: ItemDescriptor;
  time?: TimeObject;
}

export interface Category {
  id: string;
  descriptor: Descriptor;
  tags?: Tag[];
  parent_category_id?: string; // Optional because not all categories have a parent_category_id
}

export interface Stop {
  id?: string;
  authorization?: {
    type: string;
    token: string;
    valid_from: string;
    valid_to: string;
    status: string;
  };
  type: string;
  instructions?: {
    name: string;
    short_desc: string;
    long_desc?: string;
    additional_desc?: {
      url: string;
      content_type: string;
    };
  };
  location?: {
    id?: string;
    descriptor?: { name: string,images?:string[] };
    gps: string;
    address: string;
    city: {
      name: string;
    };
    country: {
      code: string;
    };
    area_code: string;
    state: {
      name: string;
    };
  };
  contact?: {
    phone?: string;
    email: string;
  };
  time?: Time;
  customer?: {
    person: {
      name: string;
    };
  };
  person: {
    name: string;
  };
  tags?: Tag;
}
export interface Fulfillment {
  id: string;
  state: {
    descriptor: Descriptor;
  };
  type: string;
  tracking: boolean;
  stops: Stop[];
  rateable?: boolean;
  tags: Tag[];
  end?:{},
  start?:{}
}
interface Params {
  amount: string;
  currency: string;
  transaction_id: string;
  bank_account_number: string;
  virtual_payment_address: string;
}
export interface Payment {
  id: string;
  collected_by: string;
  params: Params;
  status: string;
  type: string;
  tags: Tag[];
  tl_method?:string;
  uri?:string;
  "@ondc/org/settlement_details"?: SettlementDetails[];
  "@ondc/org/settlement_basis"?:string;
  "@ondc/org/settlement_window"?:string;
  "@ondc/org/withholding_amount"?:string;

}

export interface Breakup {
  "@ondc/org/item_id"?: string;
  "@ondc/org/item_quantity"?: {
    count: number;
  };
  title: string;
  "@ondc/org/title_type"?: string;
  price: Price;
  item?: {
    price: Price;
  };
}
