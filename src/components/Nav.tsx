import { Link, NavLink } from 'react-router-dom';
import CartButton from '../cart/CartButton';

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 48 48" aria-hidden="true">
      <rect className="mark__a" x="0.5" y="0.5" width="21" height="21" rx="5.5" fill="#4386E0" />
      <circle className="mark__b" cx="37" cy="11" r="10.5" fill="#FF5723" />
      <polygon className="mark__c" points="0.5,26.5 0.5,47.5 20,37" fill="#FFC701" />
      <rect className="mark__d" x="26.5" y="26.5" width="21" height="21" rx="5.5" fill="#00695C" />
    </svg>
  );
}

export default function Nav() {
  return (
      <div className="nav-holder">
        <div className="wrap">
          <nav className="nav">
            <Link className="brand" to="/" aria-label="GENIUS">
              <Mark />
              <span>GENIUS</span>
            </Link>
            <ul>
              <li><NavLink to="/" className={({isActive})=>isActive?'on':''} end>الرئيسية</NavLink></li>
              <li><NavLink to="/store" className={({isActive})=>isActive?'on':''}>المنتجات</NavLink></li>
              <li><a href="/#play">الحلبة</a></li>
              <li><a href="/#story">الأكاديمية</a></li>
            </ul>
            <span className="spacer" />
            <div className="auth">
              <CartButton />
              <a className="btn btn-plain" href="#">تسجيل الدخول</a>
              <a className="btn btn-gold" href="#">إنشاء حساب</a>
            </div>
          </nav>
        </div>
      </div>
  );
}
