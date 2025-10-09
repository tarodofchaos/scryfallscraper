import React, { useEffect, useState, useRef } from 'react';

const Header = ({ setUser, setView, view }) => {
  const [localUser, setLocalUser] = useState(null);
  const inventoryBtnRef = useRef();

  useEffect(() => {
    fetch('http://localhost:4000/api/me', {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.ok) {
          setLocalUser(data.user);
          setUser && setUser(data.user);
        } else {
          setLocalUser(null);
          setUser && setUser(null);
        }
      });
  }, [setUser]);

  function handleGoogleLogin() {
    window.location.href = 'http://localhost:4000/auth/google';
  }

  function handleLogout() {
    window.location.href = 'http://localhost:4000/logout';
  }

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto p-4 flex gap-4 items-center">
        <h1 className="text-2xl font-semibold">MTG Catalogue + Marketplace</h1>
        <div>
          {localUser ? (
            <>
              <span className="mr-2">{localUser.display || localUser.email}</span>
              <button className="btn bg-white text-neutral-900" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="btn bg-white text-neutral-900" onClick={handleGoogleLogin}>Login with Google</button>
          )}
        </div>
        <nav className="ml-auto flex gap-2">
          {['Search','Inventory','Marketplace'].map(v => (
            v === 'Inventory' ? (
              <button
                key={v}
                ref={inventoryBtnRef}
                onClick={() => setView(v)}
                className={`btn ${view===v? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900':'bg-neutral-100 dark:bg-neutral-800'}`}
                id="inventory-btn"
              >{v}</button>
            ) : (
              <button key={v} onClick={() => setView(v)} className={`btn ${view===v? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900':'bg-neutral-100 dark:bg-neutral-800'}`}>{v}</button>
            )
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;