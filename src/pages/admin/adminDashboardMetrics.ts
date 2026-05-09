import type { Load, Producer, ProducerUnit } from '../../types';

export type UnitPerformanceMetric = {
  key: string;
  producerId: string;
  producerName: string;
  unitName: string;
  loadCount: number;
  grossWeight: number;
  netWeight: number;
  receivedWeight: number;
  lossWeight: number;
  financialValue: number;
  financialNetWeight: number;
  pendingPayment: number;
  isLegacy: boolean;
  isInactive: boolean;
  isSnapshot: boolean;
};

export type UnitPerformanceRow = UnitPerformanceMetric & {
  lossPercentage: number;
  avgPricePerKg: number;
};

export const normalizeFallbackKey = (value?: string) => {
  const normalized = (value || 'sem-unidade')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'sem-unidade';
};

export const aggregateUnitPerformance = (
  companyLoads: Load[],
  producerById: Map<string, Producer>,
  unitById: Map<string, ProducerUnit>
): UnitPerformanceRow[] => {
  const metricsByUnit = new Map<string, UnitPerformanceMetric>();

  companyLoads.forEach(load => {
    const producer = producerById.get(load.producerId);
    const snapshotUnitName = load.collection?.producerUnitName?.trim();
    const fallbackLabel = snapshotUnitName || load.collection?.location?.trim() || producer?.property?.trim() || 'Sem unidade informada';
    const producerUnitId = load.collection?.producerUnitId;
    const unit = producerUnitId ? unitById.get(producerUnitId) : undefined;
    const unitMatchesLoad = !!unit && unit.companyId === load.companyId && unit.producerId === load.producerId;

    const key = producerUnitId
      ? `unit:${producerUnitId}`
      : `legacy:${load.producerId}:${normalizeFallbackKey(fallbackLabel)}`;

    const metric = metricsByUnit.get(key) || {
      key,
      producerId: load.producerId,
      producerName: producer?.name || 'Produtor desconhecido',
      unitName: producerUnitId
        ? (unitMatchesLoad ? unit!.name : fallbackLabel)
        : fallbackLabel,
      loadCount: 0,
      grossWeight: 0,
      netWeight: 0,
      receivedWeight: 0,
      lossWeight: 0,
      financialValue: 0,
      financialNetWeight: 0,
      pendingPayment: 0,
      isLegacy: !producerUnitId,
      isInactive: unitMatchesLoad ? !unit!.isActive : false,
      isSnapshot: !!producerUnitId && !unitMatchesLoad
    };

    metric.loadCount += 1;
    metric.grossWeight += load.collection?.grossWeight || 0;
    metric.netWeight += load.processing?.netWeight || load.financial?.netWeight || 0;
    metric.receivedWeight += load.processing?.receivedWeight || 0;
    metric.lossWeight += (load.processing?.damage || 0) + (load.processing?.discard || 0);
    metric.financialValue += load.financial?.finalValue || 0;
    metric.financialNetWeight += load.financial?.netWeight || 0;
    if (load.status === 'pagamento_programado') {
      metric.pendingPayment += load.financial?.finalValue || 0;
    }

    metricsByUnit.set(key, metric);
  });

  return Array.from(metricsByUnit.values())
    .map(metric => ({
      ...metric,
      lossPercentage: metric.receivedWeight > 0 ? (metric.lossWeight / metric.receivedWeight) * 100 : 0,
      avgPricePerKg: metric.financialNetWeight > 0 ? metric.financialValue / metric.financialNetWeight : 0
    }))
    .sort((a, b) => b.grossWeight - a.grossWeight);
};
