import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <div className="wrap">
      <footer className="foot">
        <span>GENIUS · مكعبات السرعة والأكاديمية</span>
        <Link className="foot__link" to="/privacy">سياسة الخصوصية</Link>
        <span>بغداد · العراق</span>
      </footer>
    </div>
  );
}
