import { formatPrice } from '../utils/parts';

export default function OffersTable({ offers, brand, titleId }) {
  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h2 className="h5 mb-1" id={titleId}>Предложения и аналоги</h2>
          <span className="text-secondary">Производитель: {brand}</span>
        </div>
        <span className="badge text-bg-secondary">Всего: {offers.length}</span>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 offers-table">
          <thead>
            <tr>
              <th scope="col">Название / производитель</th>
              <th scope="col">Артикул</th>
              <th scope="col">Склад</th>
              <th scope="col">Остаток</th>
              <th scope="col" className="text-end">Цена</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td>
                  <div className="fw-semibold">{offer.name}</div>
                  <div className="text-secondary small">{offer.brand}</div>
                  <div className="mt-1">
                    <span className={`badge ${offer.isAnalogue ? 'text-bg-warning' : 'text-bg-light'}`}>
                      {offer.isAnalogue ? 'Аналог' : 'Искомая деталь'}
                    </span>
                    {offer.notRefund && (
                      <span className="badge text-bg-danger ms-1">Без возврата</span>
                    )}
                  </div>
                </td>
                <td className="text-nowrap">{offer.number}</td>
                <td>{offer.warehouse}</td>
                <td className="text-nowrap">
                  {offer.stock > 0 ? `${offer.stock} шт.` : 'Нет'}
                </td>
                <td className="text-end text-nowrap fw-semibold">
                  {formatPrice(offer.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
