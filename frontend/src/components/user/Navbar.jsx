import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingBag, FaUserCircle, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import '../../styles/user/navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const closeMenu = () => setMenuOpen(false);
  const submitSearch = (event) => {
    event.preventDefault();
    navigate(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}` : '/shop');
    closeMenu();
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo" onClick={closeMenu} aria-label="ShopEase home">
          <span className="logo-mark"><FaShoppingBag /></span>
          <span><strong>ShopEase</strong><small>Shop smart. Live better.</small></span>
        </Link>

        <form className="search-bar" onSubmit={submitSearch}>
          <FaSearch aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for products, brands and more" aria-label="Search products" />
          <button type="submit">Search</button>
        </form>

        <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
          <NavLink to="/shop" onClick={closeMenu}>Shop</NavLink>
          <NavLink to="/categories" onClick={closeMenu}>Categories</NavLink>
          <NavLink to="/image-search" onClick={closeMenu}>Image Search</NavLink>
          <NavLink to="/about-us" onClick={closeMenu}>About</NavLink>
        </nav>

        <div className="nav-icons">
          <Link to="/wishlist" className="nav-action" aria-label="Wishlist"><FaHeart /><span>Wishlist</span></Link>
          <Link to="/cart" className="nav-action" aria-label="Shopping cart"><FaShoppingBag /><span>Cart</span></Link>
          <Link to="/profile" className="nav-action" aria-label="My account"><FaUserCircle /><span>Account</span></Link>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
