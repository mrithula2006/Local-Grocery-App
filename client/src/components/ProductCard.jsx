import React from 'react';
import { Star, Plus, Minus, Check } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { items, addToCart, updateQuantity } = useCart();

  const cartItem = items.find((item) => item.product === product._id);
  const isInCart = !!cartItem;
  const currentQty = cartItem ? cartItem.quantity : 0;

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-brand-400 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {hasDiscount && (
          <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        {isLowStock && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
            Only {product.stock} left!
          </span>
        )}
      </div>

      {/* Product Image Container */}
      <div className="h-44 sm:h-48 w-full bg-slate-50 relative overflow-hidden flex items-center justify-center p-3">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-black uppercase px-3 py-1.5 rounded-lg shadow-lg tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating ? product.rating.toFixed(1) : '4.5'}</span>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 mt-1" title={product.name}>
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 mt-1 font-medium">{product.unit || '1 unit'}</p>
        </div>

        {/* Pricing and Cart Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">
                {formatPrice(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-semibold">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Cart Stepper or Add Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : isInCart ? (
            <div className="flex items-center bg-brand-50 border border-brand-200 rounded-xl p-0.5 shadow-sm">
              <button
                onClick={() => updateQuantity(product._id, currentQty - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-brand-700 hover:bg-brand-600 hover:text-white transition shadow-xs"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-black text-xs text-brand-900">
                {currentQty}
              </span>
              <button
                onClick={() => updateQuantity(product._id, currentQty + 1)}
                disabled={currentQty >= product.stock}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 transition shadow-xs"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, 1)}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-brand-500/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
