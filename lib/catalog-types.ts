export type StorageType = "SSD" | "NVMe";
export type Architecture = "x86_64" | "arm64";

export type CatalogLocation = {
  id: number;
  code: string;
  name: string;
  country: string;
  region: string;
};

export type CatalogProvider = {
  slug: string;
  name: string;
  description: string;
  websiteUrl: string;
  affiliateLinkId: string;
  headquarters: string;
  foundedYear: number | null;
  features: string[];
  pros: string[];
  cons: string[];
  bestUseCases: string[];
  alternatives: string[];
  active: boolean;
  lastUpdated: string;
  locations: CatalogLocation[];
};

export type CatalogPlan = {
  slug: string;
  providerSlug: string;
  providerName: string;
  providerAffiliateLinkId: string;
  name: string;
  cpu: number;
  ram: number;
  storage: number;
  storageType: StorageType;
  architecture: Architecture;
  transferTb: number | null;
  networkSpeedMbps: number | null;
  egressCostPerGb: number | null;
  ipv4: boolean;
  ipv6: boolean;
  priceMonthly: number;
  currency: string;
  setupFee: number;
  backupAvailable: boolean;
  snapshotAvailable: boolean;
  slaPercent: number | null;
  promotion: string;
  available: boolean;
  sourceUrl: string;
  note: string;
  lastUpdated: string;
  locations: CatalogLocation[];
};
