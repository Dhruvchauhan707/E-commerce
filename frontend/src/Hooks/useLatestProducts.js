import { useEffect, useState } from 'react';
import { productApi } from '../Api/productApi';

export default function useLatestProducts() {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    productApi.getLatestProducts()
      .then((products) => { if (active) setLatestProducts(Array.isArray(products) ? products : []); })
      .catch((err) => { if (active) setError(err); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { latestProducts, loading, error };
}
