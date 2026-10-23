export function extractBrands(goods) {
  if (!Array.isArray(goods)) return [];

  const brands = new Map();

  for (const item of goods) {
    const brand = String(item?.brand ?? '').trim();
    const number = String(item?.number ?? '').trim();

    if (!brand || !number) continue;

    const key = brand.toLocaleLowerCase('ru-RU');
    const current = brands.get(key);

    if (current) {
      current.count += 1;
    } else {
      brands.set(key, { name: brand, count: 1 });
    }
  }

  return [...brands.values()].sort((a, b) => a.name.localeCompare(b.name, 'ru-RU'));
}

export function flattenOffers(goods) {
  if (!Array.isArray(goods)) return [];

  const offers = [];
  const seen = new Set();

  function addProduct(item, isAnalogue) {
    if (!item || !String(item.brand ?? '').trim() || !String(item.number ?? '').trim()) return;

    const warehouses = Array.isArray(item.warehouses) && item.warehouses.length
      ? item.warehouses
      : [null];

    for (const warehouse of warehouses) {
      const priceValue = warehouse?.price;
      const price = priceValue == null || priceValue === '' || !Number.isFinite(Number(priceValue))
        ? null
        : Number(priceValue);
      const stockValue = warehouse ? warehouse.stock : item.count;
      const stock = Number.isFinite(Number(stockValue)) ? Math.max(0, Number(stockValue)) : 0;
      const identity = item.goodsID || `${item.brand}|${item.number}|${item.name ?? ''}`;
      const warehouseKey = warehouse ? `${warehouse.id ?? warehouse.code ?? ''}|${warehouse.shipmentDate ?? ''}|${price}` : 'none';
      const uniqueKey = `${identity}|${warehouseKey}|${isAnalogue}`;

      if (seen.has(uniqueKey)) continue;
      seen.add(uniqueKey);

      offers.push({
        id: uniqueKey,
        brand: String(item.brand),
        number: String(item.number),
        name: String(item.name || 'Наименование не указано'),
        price,
        stock,
        warehouse: warehouse?.code || 'Склад',
        isAnalogue,
        notRefund: Boolean(warehouse?.notRefund ?? item.notRefund),
      });
    }
  }

  for (const item of goods) {
    addProduct(item, false);

    if (Array.isArray(item?.analogues)) {
      for (const analogue of item.analogues) {
        addProduct(analogue, true);
      }
    }
  }

  return offers.sort((a, b) =>
    Number(a.isAnalogue) - Number(b.isAnalogue) ||
    (a.price ?? Infinity) - (b.price ?? Infinity) ||
    b.stock - a.stock
  );
}

export function formatPrice(value) {
  return value == null
    ? '—'
    : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value);
}
