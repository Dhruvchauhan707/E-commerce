// src/hooks/useProducts.js
import { useState, useEffect } from 'react';
import { productApi } from '../Api/productApi';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await productApi.getAllProducts();
            setProducts(Array.isArray(data) ? data : (data?.products || []));
        } catch (err) {
            setError("Failed to load products");
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = async (category, search, price) => {
        try {
            setLoading(true);

            const data = await productApi.getFilteredProducts(
                category,
                search,
                price
            );

            setProducts(Array.isArray(data) ? data : (data?.products || []));

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };


    const createProduct = async (productData) => {
        try {
            await productApi.createProduct(productData);
            await fetchProducts();
        } catch (error) {
            console.log(error)
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            await productApi.updateProduct(id, productData);
            await fetchProducts();
        } catch (error) {
            console.log(error);
        }
    };

    const deleteProduct = async (id) => {
        try {
            await productApi.deleteProduct(id);
            await fetchProducts();
        } catch (error) {
            console.log(error);
        }
    };

    const getProductById = async (id) => {

        try {

            const data =
                await productApi.getProductById(id);

            return data;

        } catch (error) {

            console.log(error);

        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return { products, productLoading:loading, error, refetch: fetchProducts, filterProducts, deleteProduct, createProduct, updateProduct, getProductById};
};

