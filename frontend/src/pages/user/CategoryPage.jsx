import React, { useMemo, useState } from "react";
import { FaSortAmountDown, FaThLarge } from "react-icons/fa";
import "../../styles/user/CategoryPage.css";
import Footer from "../../components/user/Footer";
import ProductCard from "../../components/user/ProductCard";
import { useCategories } from "../../Hooks/useCategories";
import { useProducts } from "../../Hooks/useProducts";
import Loader from "../../components/common/Loader";

const CategoryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const { categories = [], categoryLoading } = useCategories();
  const { products: allProducts = [], productLoading } = useProducts();

  const filteredProducts = useMemo(() => {
    const filtered = selectedCategory === "all"
      ? [...allProducts]
      : allProducts.filter((product) => {
          const productCategory = product.category?._id || product.category?.id || product.category;
          return String(productCategory) === String(selectedCategory);
        });
    if (sortOrder === "price-low") filtered.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortOrder === "price-high") filtered.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortOrder === "newest") filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return filtered;
  }, [allProducts, selectedCategory, sortOrder]);

  if (productLoading || categoryLoading) return <Loader />;

  return (
    <>
      <main className="category-page category-storefront">
        <section className="category-hero">
          <span className="category-eyebrow">Find your favourites</span>
          <h1>Shop by Category</h1>
          <p>Explore our collections and discover something you’ll love.</p>
        </section>

        <section className="category-picker" aria-label="Choose a category">
          <button type="button" className={`category-tile category-all ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")} aria-pressed={selectedCategory === "all"}>
            <span className="category-tile-image category-all-icon"><FaThLarge /></span>
            <span className="category-name">All Products</span>
            <span className="category-tile-caption">Browse everything</span>
          </button>
          {categories.map((cat) => (
            <button type="button" key={cat._id}
              className={`category-tile ${String(selectedCategory) === String(cat._id) ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat._id)}
              aria-pressed={String(selectedCategory) === String(cat._id)}>
              <span className="category-tile-image"><img src={cat.image} alt={cat.name} loading="lazy" /></span>
              <span className="category-name">{cat.name}</span>
              <span className="category-tile-caption">Explore collection</span>
            </button>
          ))}
        </section>

        <section className="category-products-section">
          <div className="category-products-header">
            <div>
              <span className="category-eyebrow">Curated for you</span>
              <h2>{selectedCategory === "all" ? "All Products" : categories.find((c) => String(c._id) === String(selectedCategory))?.name || "Products"}</h2>
              <p>{filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} available</p>
            </div>
            <label className="category-sort">
              <FaSortAmountDown aria-hidden="true" />
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} aria-label="Sort products">
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </label>
          </div>
          {filteredProducts.length ? (
            <div className="category-products-grid">
              {filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          ) : (
            <div className="category-empty">
              <div className="category-empty-icon"><FaThLarge /></div>
              <h3>No products found</h3>
              <p>There are no products in this collection right now.</p>
              <button type="button" onClick={() => setSelectedCategory("all")}>View all products</button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CategoryPage;
