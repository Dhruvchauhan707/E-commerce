import React from 'react';
import '../../styles/user/Categories.css';
import { Link } from 'react-router-dom';

const Categories = ({ categories = [] }) => (
  <section className="categories-section">
    <div className="section-header">
      <div className="header-content">
        <div>
          <h2>Shop by Category</h2>
          <p>Find exactly what you are looking for</p>
        </div>
        <button className="view-all-btn"><Link to="/categories">Explore all categories →</Link></button>
      </div>
    </div>
    <div className="categories-grid">
      {categories.filter((category) => category._id !== 'all').slice(0, 8).map((category) => (
        <Link className="category-card" key={category._id} to="/categories" aria-label={`Explore ${category.name}`}>
          <img src={category.image} alt={category.name} loading="lazy" />
          <div className="category-overlay"><h3>{category.name}</h3><p>Explore collection</p></div>
        </Link>
      ))}
    </div>
  </section>
);

export default Categories;
