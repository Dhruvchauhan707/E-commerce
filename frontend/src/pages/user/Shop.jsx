import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/user/ProductCard';
import '../../styles/user/shop.css';
import Footer from '../../components/user/Footer';

import { useProducts } from '../../Hooks/useProducts';
import { useCategories } from '../../Hooks/useCategories';
import Loader from '../../components/common/Loader';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState(100000);
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("");

  const { products, productLoading , filterProducts } = useProducts();

  useEffect(() => {
    const initialSearch = searchParams.get('search');
    if (initialSearch) filterProducts('', initialSearch, priceRange);
    // Apply only when the URL search query changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleFilterClick = () => {
    filterProducts(
      selectedCategory,
      searchTerm,
      priceRange
    );
  };

  if (productLoading) {
    return <Loader />
  }

  return (
   <>
    <div className="shop-page">
      <div className="shop-header">
        <h1>Shop All Products</h1>
      </div>

      <div className="shop-container">
        <div className="filters-sidebar">
          <h3>Filters</h3>

          <div className="filter-group">
            <h4>Search</h4>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <h4>Category</h4>
            {categories.map((cat, index) => (
              <label key={index} className="filter-label">

                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat._id}
                  onChange={() => setSelectedCategory(cat._id)}
                />

                {cat.name}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Price Range: ₹0 - ₹{priceRange}</h4>
            <input
              type="range"
              min="0"
              max="1000000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
            />
          </div>

          <button className="cart-btn" onClick={handleFilterClick}>Lets Filter</button>
        </div>

        <div className="products-area">
          <div className="products-line">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard
                  key={product._id} 
                  product={product}
                />
              ))
            ) : (
              <h3>No products match your criteria.</h3>
            )}
          </div>
        </div>
      </div>
    </div>
          <Footer />

   </>
  );
};

export default Shop;