import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('grocery_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('grocery_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product === product._id);
      const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        const maxStock = product.stock || 999;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, maxStock),
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            product: product._id,
            name: product.name,
            price: effectivePrice,
            originalPrice: product.price,
            unit: product.unit,
            image: product.image,
            stock: product.stock,
            quantity: Math.min(quantity, product.stock || 999),
          },
        ];
      }
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product === productId) {
          const maxStock = item.stock || 999;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.product !== productId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('grocery_cart');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = itemsPrice > 500 || items.length === 0 ? 0 : 40;
  const taxPrice = Math.round(itemsPrice * 0.05);
  const totalAmount = itemsPrice + deliveryFee + taxPrice;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        itemsPrice,
        deliveryFee,
        taxPrice,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
