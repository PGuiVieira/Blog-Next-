import Link from 'next/link';
import style from './header.module.scss';

export default function Header() {
  return (
    <header className={style.Container}>
      <Link href="/">
        <a>
          <img src="/spacetraveling.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
