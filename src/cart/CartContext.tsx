import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

/* =========================================================
   سلة التسوق. تُحفظ في المتصفح فلا تضيع عند تحديث الصفحة.
   السعر اختياري: المنتجات بلا سعر تُطلب بالتواصل، ولا نخترع رقماً.
   ========================================================= */
export type CartLine = { id: string; name: string; qty: number; price?: number };
type State = { lines: CartLine[]; open: boolean };

type Action =
  | { t: 'add'; id: string; name: string; qty: number; price?: number }
  | { t: 'setQty'; id: string; qty: number }
  | { t: 'remove'; id: string }
  | { t: 'clear' }
  | { t: 'open'; v: boolean }
  | { t: 'hydrate'; lines: CartLine[] };

const KEY = 'genius-cart-v1';
const MAX = 99;

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'hydrate': return { ...s, lines: a.lines };
    case 'add': {
      const i = s.lines.findIndex(l => l.id === a.id);
      if (i >= 0) {
        const lines = s.lines.slice();
        lines[i] = { ...lines[i], qty: Math.min(MAX, lines[i].qty + a.qty) };
        return { ...s, lines, open: true };
      }
      return { ...s, lines: [...s.lines, { id: a.id, name: a.name, qty: a.qty, price: a.price }], open: true };
    }
    case 'setQty': {
      const qty = Math.max(0, Math.min(MAX, a.qty));
      if (qty === 0) return { ...s, lines: s.lines.filter(l => l.id !== a.id) };
      return { ...s, lines: s.lines.map(l => (l.id === a.id ? { ...l, qty } : l)) };
    }
    case 'remove': return { ...s, lines: s.lines.filter(l => l.id !== a.id) };
    case 'clear': return { ...s, lines: [] };
    case 'open': return { ...s, open: a.v };
    default: return s;
  }
}

type Ctx = {
  lines: CartLine[];
  open: boolean;
  count: number;
  total: number;
  pricedAll: boolean;
  add: (l: { id: string; name: string; qty: number; price?: number }) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  setOpen: (v: boolean) => void;
};

const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], open: false });

  /* استرجاع ما كان بالسلة سابقاً */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const clean = parsed
          .filter(l => l && typeof l.id === 'string' && typeof l.name === 'string')
          .map(l => ({ id: l.id, name: l.name, qty: Math.max(1, Math.min(MAX, Number(l.qty) || 1)),
                       price: typeof l.price === 'number' ? l.price : undefined }));
        if (clean.length) dispatch({ t: 'hydrate', lines: clean });
      }
    } catch { /* تخزين معطّل أو بيانات تالفة: نبدأ بسلة فارغة */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state.lines)); } catch { /* لا شيء */ }
  }, [state.lines]);

  const value = useMemo<Ctx>(() => {
    const count = state.lines.reduce((n, l) => n + l.qty, 0);
    const pricedAll = state.lines.length > 0 && state.lines.every(l => typeof l.price === 'number');
    const total = state.lines.reduce((n, l) => n + (l.price ?? 0) * l.qty, 0);
    return {
      lines: state.lines, open: state.open, count, total, pricedAll,
      add: l => dispatch({ t: 'add', ...l }),
      setQty: (id, qty) => dispatch({ t: 'setQty', id, qty }),
      remove: id => dispatch({ t: 'remove', id }),
      clear: () => dispatch({ t: 'clear' }),
      setOpen: v => dispatch({ t: 'open', v }),
    };
  }, [state]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error('useCart خارج CartProvider');
  return c;
}
