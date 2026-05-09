import assert from 'node:assert/strict';
import { aggregateUnitPerformance, normalizeFallbackKey } from './adminDashboardMetrics.ts';
import type { Load, Producer, ProducerUnit } from '../../types';

const producer = (id: string, name: string, property = 'Boa Vista'): Producer => ({
  id,
  companyId: 'company-1',
  name,
  property,
  phone: '',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

const unit = (
  id: string,
  producerId: string,
  name: string,
  overrides: Partial<ProducerUnit> = {}
): ProducerUnit => ({
  id,
  companyId: 'company-1',
  producerId,
  name,
  location: '',
  description: '',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides
});

const load = (
  id: string,
  producerId: string,
  options: {
    producerUnitId?: string;
    producerUnitName?: string;
    location?: string;
    grossWeight?: number;
    receivedWeight?: number;
    damage?: number;
    discard?: number;
    netWeight?: number;
    finalValue?: number;
    financialNetWeight?: number;
    status?: Load['status'];
  } = {}
): Load => ({
  id,
  companyId: 'company-1',
  producerId,
  status: options.status || 'pago',
  collection: {
    id: `${id}-collection`,
    date: '2026-01-01T00:00:00.000Z',
    location: options.location || '',
    producerUnitId: options.producerUnitId,
    producerUnitName: options.producerUnitName,
    category: 'Frutas',
    type: 'Banana',
    boxes: 1,
    grossWeight: options.grossWeight || 0,
    responsibleId: 'user-1',
    photos: []
  },
  processing: {
    id: `${id}-processing`,
    fieldWeight: 0,
    receivedWeight: options.receivedWeight || 0,
    damage: options.damage || 0,
    discard: options.discard || 0,
    greenWeight: 0,
    netWeight: options.netWeight || 0,
    weightDifference: 0,
    stockWeight: 0,
    productionWeight: 0,
    bulkSaleWeight: 0,
    photos: []
  },
  financial: {
    id: `${id}-financial`,
    netWeight: options.financialNetWeight || 0,
    pricePerKg: 0,
    discounts: 0,
    grossValue: options.finalValue || 0,
    finalValue: options.finalValue || 0,
    scheduledPaymentDate: '2026-01-10'
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

const producers = [
  producer('producer-1', 'Produtor A'),
  producer('producer-2', 'Produtor B')
];

const producerUnits = [
  unit('unit-active', 'producer-1', 'Talhao Atual'),
  unit('unit-inactive', 'producer-1', 'Talhao Inativo', { isActive: false }),
  unit('unit-cross-company', 'producer-1', 'Unidade de Outra Empresa', { companyId: 'company-2' }),
  unit('unit-cross-producer', 'producer-2', 'Unidade de Outro Produtor')
];

const rows = aggregateUnitPerformance(
  [
    load('load-active-1', 'producer-1', {
      producerUnitId: 'unit-active',
      producerUnitName: 'Nome snapshot antigo',
      grossWeight: 100,
      receivedWeight: 100,
      damage: 5,
      discard: 5,
      netWeight: 70,
      finalValue: 600,
      financialNetWeight: 60
    }),
    load('load-active-2', 'producer-1', {
      producerUnitId: 'unit-active',
      grossWeight: 50,
      receivedWeight: 50,
      damage: 2,
      discard: 3,
      netWeight: 40,
      finalValue: 300,
      financialNetWeight: 20
    }),
    load('load-legacy-1', 'producer-1', {
      location: 'Boa Vista',
      grossWeight: 30,
      receivedWeight: 30,
      netWeight: 30,
      finalValue: 300,
      financialNetWeight: 30
    }),
    load('load-legacy-2', 'producer-2', {
      location: 'Boa Vista',
      grossWeight: 40,
      receivedWeight: 40,
      damage: 2,
      netWeight: 38,
      finalValue: 380,
      financialNetWeight: 38
    }),
    load('load-inactive', 'producer-1', {
      producerUnitId: 'unit-inactive',
      grossWeight: 25,
      receivedWeight: 25,
      damage: 1,
      discard: 1,
      netWeight: 23,
      finalValue: 230,
      financialNetWeight: 23,
      status: 'pagamento_programado'
    }),
    load('load-missing-unit', 'producer-2', {
      producerUnitId: 'unit-removed',
      producerUnitName: 'Unidade Removida Snapshot',
      grossWeight: 20,
      receivedWeight: 20,
      damage: 1,
      discard: 1,
      netWeight: 18,
      finalValue: 180,
      financialNetWeight: 18
    }),
    load('load-cross-company', 'producer-1', {
      producerUnitId: 'unit-cross-company',
      producerUnitName: 'Snapshot Empresa Segura',
      grossWeight: 10,
      receivedWeight: 10,
      netWeight: 10,
      finalValue: 100,
      financialNetWeight: 10
    }),
    load('load-cross-producer', 'producer-1', {
      producerUnitId: 'unit-cross-producer',
      producerUnitName: 'Snapshot Produtor Seguro',
      grossWeight: 11,
      receivedWeight: 11,
      netWeight: 11,
      finalValue: 110,
      financialNetWeight: 11
    })
  ],
  new Map(producers.map(item => [item.id, item])),
  new Map(producerUnits.map(item => [item.id, item]))
);

const byKey = new Map(rows.map(row => [row.key, row]));

const active = byKey.get('unit:unit-active');
assert(active, 'carga nova deve usar chave unit:${producerUnitId}');
assert.equal(active.unitName, 'Talhao Atual', 'unidade vinculada deve usar dados atuais de producerUnits');
assert.equal(active.loadCount, 2);
assert.equal(active.grossWeight, 150);
assert.equal(active.netWeight, 110);
assert.equal(active.financialValue, 900);
assert.equal(active.lossPercentage, 10);
assert.equal(active.avgPricePerKg, 11.25);

assert.equal(normalizeFallbackKey('Boa Vista'), 'boa-vista');
const legacyProducerA = byKey.get('legacy:producer-1:boa-vista');
const legacyProducerB = byKey.get('legacy:producer-2:boa-vista');
assert(legacyProducerA, 'carga legada do produtor A deve usar chave composta por produtor');
assert(legacyProducerB, 'carga legada do produtor B deve usar chave composta por produtor');
assert.equal(legacyProducerA.grossWeight, 30);
assert.equal(legacyProducerB.grossWeight, 40);
assert.notEqual(legacyProducerA.key, legacyProducerB.key, 'legado nao deve misturar produtores com mesmo location/property');

const inactive = byKey.get('unit:unit-inactive');
assert(inactive, 'unidade inativa deve permanecer no historico');
assert.equal(inactive.isInactive, true);
assert.equal(inactive.pendingPayment, 230);

const removed = byKey.get('unit:unit-removed');
assert(removed, 'unidade removida deve manter chave unit:${producerUnitId}');
assert.equal(removed.unitName, 'Unidade Removida Snapshot');
assert.equal(removed.isSnapshot, true);

const crossCompany = byKey.get('unit:unit-cross-company');
assert(crossCompany, 'carga com unit id cross-tenant ainda deve ser agregada pela chave da carga');
assert.equal(crossCompany.unitName, 'Snapshot Empresa Segura');
assert.equal(crossCompany.isSnapshot, true);
assert.notEqual(crossCompany.unitName, 'Unidade de Outra Empresa');

const crossProducer = byKey.get('unit:unit-cross-producer');
assert(crossProducer, 'carga com unit id de outro produtor ainda deve ser agregada pela chave da carga');
assert.equal(crossProducer.unitName, 'Snapshot Produtor Seguro');
assert.equal(crossProducer.isSnapshot, true);
assert.notEqual(crossProducer.unitName, 'Unidade de Outro Produtor');

console.log('adminDashboardMetrics tests passed');
