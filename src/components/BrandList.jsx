export default function BrandList({ brands, selectedBrand, onSelect }) {
  return (
    <div className="row g-2">
      {brands.map(({ name, count }) => (
        <div className="col-sm-6 col-lg-4" key={name}>
          <button
            type="button"
            className={`brand-button ${selectedBrand === name ? 'brand-button-active' : ''}`}
            onClick={() => onSelect(name)}
            aria-pressed={selectedBrand === name}
          >
            <span className="text-truncate">{name}</span>
            <small>{count} поз.</small>
          </button>
        </div>
      ))}
    </div>
  );
}
