import { useCart } from './CartContext';

/* زر السلة في الشريط، مع عدد القطع */
export default function CartButton() {
  const { count, open, setOpen } = useCart();
  return (
      <button
        type="button"
        className="cartbtn"
        onClick={() => setOpen(!open)}
        aria-label={`السلة، ${count} قطعة`}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
          <path d="M6 6L5 2H2" />
        </svg>
        {count > 0 && <span className="cartbtn__n">{count}</span>}
      </button>
  );
}
