import { useEffect, useRef } from 'react';
import { useCart } from './CartContext';

const money = (n: number) => n.toLocaleString('ar-IQ') + ' د.ع';

/* لوحة السلة: تنزلق من الجانب، وتُغلق بالمفتاح Escape أو بالنقر خارجها */
export default function CartPanel() {
  const { lines, open, setOpen, setQty, remove, clear, count, total, pricedAll } = useCart();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    /* التركيز ينتقل للوحة حتى يتابعها قارئ الشاشة */
    panel.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  /* رسالة الطلب: نجهّزها للنسخ أو للإرسال عبر واتساب */
  const orderText = () => {
    const items = lines.map(l => `• ${l.name} × ${l.qty}`).join('\n');
    return `طلب من GENIUS\n\n${items}\n\nالمجموع: ${pricedAll ? money(total) : 'يُحدَّد عند التأكيد'}`;
  };

  return (
    <>
      {open && <div className="cart__veil" onClick={() => setOpen(false)} />}

      <aside
        className={'cart' + (open ? ' open' : '')}
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="سلة التسوق"
        aria-hidden={!open}
      >
        <header className="cart__head">
          <h2>السلة</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق">✕</button>
        </header>

        {lines.length === 0 ? (
          <p className="cart__empty">السلة فارغة. اختر مكعباً وأضفه.</p>
        ) : (
          <>
            <ul className="cart__list">
              {lines.map(l => (
                <li key={l.id}>
                  <div className="cart__row">
                    <span className="cart__name">{l.name}</span>
                    <button type="button" className="cart__x" onClick={() => remove(l.id)} aria-label={`احذف ${l.name}`}>✕</button>
                  </div>
                  <div className="cart__row cart__row--sub">
                    <span className="atc__qty atc__qty--sm">
                      <button type="button" onClick={() => setQty(l.id, l.qty - 1)} aria-label="أنقص">−</button>
                      <input
                        type="number" min={1} max={99} value={l.qty}
                        onChange={e => setQty(l.id, Number(e.target.value) || 1)}
                        aria-label={`عدد ${l.name}`}
                      />
                      <button type="button" onClick={() => setQty(l.id, l.qty + 1)} aria-label="زد">+</button>
                    </span>
                    <span className="cart__price">
                      {typeof l.price === 'number' ? money(l.price * l.qty) : 'السعر عند التأكيد'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="cart__foot">
              <div className="cart__total">
                <span>المجموع</span>
                <b>{pricedAll ? money(total) : 'يُحدَّد عند التأكيد'}</b>
              </div>

              <a
                className="cart__go"
                href={'https://wa.me/?text=' + encodeURIComponent(orderText())}
                target="_blank"
                rel="noopener noreferrer"
              >
                أكمل الطلب عبر واتساب
              </a>

              <button type="button" className="cart__clear" onClick={clear}>أفرغ السلة</button>
              <p className="cart__note">
                الطلب يُراجَع ويُؤكَّد بالتواصل. لا يُخصم أي مبلغ من هنا.
              </p>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
