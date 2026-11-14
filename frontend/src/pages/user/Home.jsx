import "../../styles/user/home.css";

import ImageSlider from "../../components/user/ImageSlider";
import LetestProducts from "../../components/user/LatestProducts";
import Categories from "../../components/user/Categories";
import Testimonials from "../../components/user/Testimonials";
import Footer from "../../components/user/Footer";
import { useCategories } from '../../Hooks/useCategories';
import useLatestProducts from '../../Hooks/useLatestProducts';
import Loader from "../../components/common/Loader";

function HomePage() {

  const { categories, loading: categoryLoading } = useCategories();
  const { latestProducts, loading: productLoading } = useLatestProducts();

 if(categoryLoading || productLoading)
 {
    return <Loader />
 }

  return (
    <div className="home">
      <ImageSlider />

      <Categories
        categories={categories}
      />
      <LetestProducts
        products={latestProducts}
      />

      <Testimonials />

      <Footer />

    </div>
  );
}

export default HomePage;