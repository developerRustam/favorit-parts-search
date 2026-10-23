import test from 'node:test';
import assert from 'node:assert/strict';
import { extractBrands, flattenOffers, formatPrice } from '../src/utils/parts.js';

test('extractBrands removes duplicates and empty API placeholders', () => {
  assert.deepEqual(extractBrands([
    { brand: 'MEYLE', number: '123' },
    { brand: 'Meyle', number: '123' },
    { brand: 'BOSCH', number: '123' },
    { brand: '', number: '' },
  ]), [
    { name: 'BOSCH', count: 1 },
    { name: 'MEYLE', count: 2 },
  ]);
});

test('flattenOffers uses the warehouse price and includes analogues', () => {
  const offers = flattenOffers([{
    goodsID: 'part-1', brand: 'MEYLE', number: '123', name: 'Рычаг', count: 10, price: 1,
    warehouses: [{ id: 'a', code: 'СК1', price: 1200, stock: 4 }, { id: 'b', code: 'СК2', price: 1300, stock: 6 }],
    analogues: [{ goodsID: 'part-2', brand: 'MAPCO', number: '987', name: 'Аналог', count: 2, price: 2, warehouses: [{ id: 'c', price: 990, stock: 2 }] }],
  }]);

  assert.equal(offers.length, 3);
  assert.deepEqual(offers.map((item) => item.price), [1200, 1300, 990]);
  assert.equal(offers[2].isAnalogue, true);
  assert.equal(offers[2].warehouse, 'Склад');
});

test('flattenOffers shows items with empty warehouses but not the root price', () => {
  const offers = flattenOffers([{ brand: 'MEYLE', number: '123', name: 'Рычаг', price: 1200, count: 0, warehouses: [] }]);
  assert.equal(offers[0].price, null);
  assert.equal(offers[0].stock, 0);
});

test('formatPrice handles missing and valid prices', () => {
  assert.equal(formatPrice(null), '—');
  assert.match(formatPrice(12533.62), /12\s?533,62/);
});
