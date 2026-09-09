import { useState } from 'react';
import { useCart } from './CartContext';

/* عدّاد قطع + زر إضافة، يجلس تحت كل مكعب */
export default function AddToCart({ id, name, price }: { id: string; name: string; price?: number }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);

  const bump = (d: number) => setQty(q => Math.max(1, Math.min(99, q + d)));

  const submit = () => {
    add({ id, name, qty, price });
    setDone(true);
    window.setTimeout(() => setDone(false), 1600);
  };

  return (
    <div className="atc">
      <div className="atc__qty" role="group" aria-label={`عدد القطع من ${name}`}>
        <button type="button" onClick={() => bump(-1)} disabled={qty <= 1} aria-label="أنقص قطعة">−</button>
        <input
          type="number" min={1} max={99} value={qty}
          onChange={e => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
          aria-label="عدد القطع"
        />
        <button type="button" onClick={() => bump(1)} disabled={qty >= 99} aria-label="زد قطعة">+</button>
      </div>

      <button type="button" className={'atc__add' + (done ? ' done' : '')} onClick={submit}>
        {done ? 'أُضيف للسلة' : 'أضف إلى السلة'}
      </button>
    </div>
  );
}
