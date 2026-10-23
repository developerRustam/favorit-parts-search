import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BrandList from './components/BrandList';
import OffersTable from './components/OffersTable';
import StatusPanel from './components/StatusPanel';
import { clearSelection, fetchBrands, fetchOffers, selectBrand, setArticle } from './features/catalog/catalogSlice';

export default function App() {
  const dispatch = useDispatch();
  const catalog = useSelector((state) => state.catalog);
  const brandRequest = useRef(null);
  const offersRequest = useRef(null);
  const searchTimer = useRef(null);

  const {
    article,
    brands,
    brandsStatus,
    brandsError,
    selectedBrand,
    offers,
    offersStatus,
    offersError,
  } = catalog;

  useEffect(() => {
    const number = article.trim();
    if (!number) return undefined;

    searchTimer.current = setTimeout(() => {
      brandRequest.current?.abort();
      brandRequest.current = dispatch(fetchBrands(number));
    }, 500);

    return () => {
      clearTimeout(searchTimer.current);
      brandRequest.current?.abort();
    };
  }, [article, dispatch]);

  useEffect(() => {
    offersRequest.current?.abort();
  }, [article]);

  useEffect(() => () => offersRequest.current?.abort(), []);

  function searchBrands(event) {
    event?.preventDefault();
    const number = article.trim();
    if (!number) return;

    clearTimeout(searchTimer.current);
    brandRequest.current?.abort();
    offersRequest.current?.abort();
    dispatch(clearSelection());
    brandRequest.current = dispatch(fetchBrands(number));
  }

  function loadOffers(brand) {
    offersRequest.current?.abort();
    dispatch(selectBrand(brand));
    offersRequest.current = dispatch(fetchOffers({ number: article.trim(), brand }));
  }

  return (
    <>
      <header className="bg-dark text-white">
        <div className="container page-container py-3">
          <strong>Поиск автозапчастей</strong>
        </div>
      </header>

      <main className="container page-container py-4 py-md-5">
        <h1 className="h3 mb-2">Поиск по артикулу</h1>
        <p className="text-secondary mb-4">
          Введите номер детали, затем выберите производителя.
        </p>

        <section className="card shadow-sm mb-4" aria-labelledby="search-title">
          <div className="card-body p-3 p-md-4">
            <h2 className="h5 mb-3" id="search-title">Артикул детали</h2>
            <form className="row g-2" onSubmit={searchBrands}>
              <div className="col-md">
                <label className="visually-hidden" htmlFor="article">Артикул</label>
                <input
                  id="article"
                  className="form-control form-control-lg"
                  type="search"
                  autoComplete="off"
                  value={article}
                  onChange={(event) => dispatch(setArticle(event.target.value))}
                  placeholder="Например, 7160500039S"
                  maxLength={100}
                />
              </div>
              <div className="col-md-auto d-grid">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={!article.trim() || brandsStatus === 'loading'}
                >
                  {brandsStatus === 'loading' ? 'Ищем…' : 'Найти'}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="card shadow-sm mb-4" aria-labelledby="brands-title">
          <div className="card-body p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
              <h2 className="h5 mb-0" id="brands-title">Производители</h2>
              {brandsStatus === 'succeeded' && brands.length > 0 && (
                <span className="badge text-bg-light">Найдено: {brands.length}</span>
              )}
            </div>

            {brandsStatus === 'idle' && (
              <StatusPanel text="Список появится после ввода артикула." />
            )}
            {brandsStatus === 'loading' && (
              <StatusPanel loading text="Загружаем производителей…" />
            )}
            {brandsStatus === 'failed' && (
              <StatusPanel error text={brandsError} onRetry={searchBrands} />
            )}
            {brandsStatus === 'succeeded' && brands.length === 0 && (
              <StatusPanel text="По этому артикулу ничего не найдено." />
            )}
            {brandsStatus === 'succeeded' && brands.length > 0 && (
              <BrandList
                brands={brands}
                selectedBrand={selectedBrand}
                onSelect={loadOffers}
              />
            )}
          </div>
        </section>

        {selectedBrand && (
          <section className="card shadow-sm" aria-labelledby="offers-title">
            <div className="card-body p-3 p-md-4">
              {offersStatus === 'loading' && (
                <StatusPanel loading text={`Загружаем предложения ${selectedBrand}…`} />
              )}
              {offersStatus === 'failed' && (
                <StatusPanel
                  error
                  text={offersError}
                  onRetry={() => loadOffers(selectedBrand)}
                />
              )}
              {offersStatus === 'succeeded' && offers.length === 0 && (
                <StatusPanel text="Предложений для этого производителя нет." />
              )}
              {offersStatus === 'succeeded' && offers.length > 0 && (
                <OffersTable offers={offers} brand={selectedBrand} titleId="offers-title" />
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
