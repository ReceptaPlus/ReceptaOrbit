import type { TrackingLink } from "@/types/domain";

/* 3 links pha_dsp: ativo com cliques · ativo zerado (empty de métricas) · desativado. */
export const trackingLinks: TrackingLink[] = [
  { id: "trk_001", pharmacyId: "pha_dsp", token: "gj7x2k", campaignName: "Genéricos Junho", channel: "META_ADS", url: "https://wa.me/551140028922?text=gj7x2k", active: true, createdAt: "2026-06-01T00:00:00Z", clickCount: 214, attributedCycleCount: 38 },
  { id: "trk_002", pharmacyId: "pha_dsp", token: "vd9p1m", campaignName: "Vitaminas Search", channel: "GOOGLE_ADS", url: "https://wa.me/551140028922?text=vd9p1m", active: true, createdAt: "2026-06-14T00:00:00Z", clickCount: 0, attributedCycleCount: 0 },
  { id: "trk_003", pharmacyId: "pha_dsp", token: "ab3z8q", campaignName: "Remarketing Maio", channel: "META_ADS", url: "https://wa.me/551140028922?text=ab3z8q", active: false, createdAt: "2026-05-01T00:00:00Z", clickCount: 512, attributedCycleCount: 71 },
];
