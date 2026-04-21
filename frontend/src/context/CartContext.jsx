import { createContext, useContext, useReducer, useEffect } from "react";
import { useNotification } from "./NotificationContext";
import { fetchCartAPI, addToCartAPI, removeFromCartAPI, syncCartAPI, clearCartAPI } from "../services/cartServices";

const CartContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD": {
      // Create a unique key for guest/local state
      const attrKey = `${action.product.id}-${action.product.selected_thickness || ""}-${action.product.selected_width || ""}-${action.product.selected_brand || ""}`;
      
      const exists = state.find((i) => {
        const iKey = `${i.id}-${i.selected_thickness || ""}-${i.selected_width || ""}-${i.selected_brand || ""}`;
        return iKey === attrKey;
      });

      if (exists) {
        return state.map((i) => {
          const iKey = `${i.id}-${i.selected_thickness || ""}-${i.selected_width || ""}-${i.selected_brand || ""}`;
          return iKey === attrKey ? { ...i, qty: i.qty + 1 } : i;
        });
      }
      return [...state, { ...action.product, qty: 1 }];
    }
    case "REMOVE": {
      return state.filter((i) => {
        if (action.cart_id && i.cart_id === action.cart_id) return false;
        if (action.local_id && i.local_id === action.local_id) return false;
        return true;
      });
    }
    case "UPDATE_QTY": {
      return state.map((i) => {
        const isMatch = (action.cart_id && i.cart_id === action.cart_id) || 
                        (action.local_id && i.local_id === action.local_id);
        return isMatch ? { ...i, qty: action.qty } : i;
      }).filter((i) => i.qty > 0);
    }
    case "CLEAR": return [];
    case "SET_CART": return action.cart;
    default: return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(reducer, JSON.parse(localStorage.getItem("cart")) || []);
  const token = localStorage.getItem("token");
  const { notifySuccess, notifyError } = useNotification();

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!token) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, token]);

  // Sync / Fetch cart on mount or login
  useEffect(() => {
    if (token) {
      const loadAndSync = async () => {
        try {
          const localItems = JSON.parse(localStorage.getItem("cart")) || [];
          if (localItems.length > 0) {
            localStorage.removeItem("cart"); // Clear BEFORE sync to prevent React Strict Mode duplicate calls
            await syncCartAPI(localItems.map(i => ({ 
              id: i.id, 
              qty: i.qty,
              thickness: i.selected_thickness,
              width: i.selected_width,
              brand: i.selected_brand
            })));
          }
          const res = await fetchCartAPI();
          if (res.success) {
            // Transform backend products to context format
            const transformed = res.cart.map(i => ({
              cart_id: i.cart_id,
              id: i.product_id,
              name: i.name,
              price: i.price,
              qty: i.quantity,
              image: i.image,
              selected_thickness: i.selected_thickness,
              selected_width: i.selected_width,
              selected_brand: i.selected_brand,
              unit: i.unit,
              color: i.color
            }));
            dispatch({ type: "SET_CART", cart: transformed });
          }
        } catch (err) {
          console.error("Cart sync failed:", err);
        }
      };
      loadAndSync();
    }
  }, [token]);

  const addToCart = async (p) => {
    // Normalize product for consistency (Guest cart use case)
    const normalizedItem = {
      ...p,
      id: p.id,
      name: p.name,
      price: p.price || p.min_price, // Ensure price field exists
      image: p.image || p.image_url, // Ensure image field exists
      unit: p.unit,
      color: p.color,
      local_id: `${p.id}-${p.selected_thickness || ""}-${p.selected_width || ""}-${p.selected_brand || ""}`
    };
    
    dispatch({ type: "ADD", product: normalizedItem });
    notifySuccess("Added to cart!");
    
    if (token) {
      try {
        const existing = cart.find(i => 
          i.id === p.id && 
          i.selected_thickness === p.selected_thickness && 
          i.selected_width === p.selected_width && 
          i.selected_brand === p.selected_brand
        );
        const newQty = existing ? existing.qty + 1 : 1;
        await addToCartAPI(p.id, newQty, {
          thickness: p.selected_thickness,
          width: p.selected_width,
          brand: p.selected_brand
        });
        // Refresh cart to get real cart_ids from backend
        const res = await fetchCartAPI();
        if (res.success) {
           const transformed = res.cart.map(i => ({
              cart_id: i.cart_id,
              id: i.product_id,
              name: i.name,
              price: i.price,
              qty: i.quantity,
              image: i.image,
              selected_thickness: i.selected_thickness,
              selected_width: i.selected_width,
              selected_brand: i.selected_brand,
              unit: i.unit,
              color: i.color
            }));
            dispatch({ type: "SET_CART", cart: transformed });
        }
      } catch (err) { console.error(err); }
    }
  };

  const removeFromCart = async (item) => {
    dispatch({ type: "REMOVE", cart_id: item.cart_id, local_id: item.local_id });
    if (token && item.cart_id) {
      try { await removeFromCartAPI(item.cart_id); } catch (err) { console.error(err); }
    }
  };

  const updateQty = async (item, qty) => {
    dispatch({ type: "UPDATE_QTY", cart_id: item.cart_id, local_id: item.local_id, qty });
    if (token && item.id) {
      try { 
        await addToCartAPI(item.id, qty, {
          thickness: item.selected_thickness,
          width: item.selected_width,
          brand: item.selected_brand
        }); 
      } catch (err) { 
        notifyError("Update failed");
        console.error(err); 
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: "CLEAR" });
    if (token) {
      try { await clearCartAPI(); } catch (err) { console.error(err); }
    }
  };

  const total = cart.reduce((s, i) => s + (Number(i.price) || 0) * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
