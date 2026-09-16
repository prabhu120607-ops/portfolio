'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const { user } = useAuth();

  // Load wishlist from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('nova_wishlist');
    if (stored) {
      setWishlistIds(JSON.parse(stored));
    }
  }, []);

  // Save to local storage on change
  const saveWishlist = (ids: string[]) => {
    setWishlistIds(ids);
    localStorage.setItem('nova_wishlist', JSON.stringify(ids));
  };

  const toggleWishlist = (productId: string) => {
    const exists = wishlistIds.includes(productId);
    let updated: string[];
    
    if (exists) {
      updated = wishlistIds.filter(id => id !== productId);
    } else {
      updated = [...wishlistIds, productId];
    }
    
    saveWishlist(updated);

    // Mock API sync if user is logged in
    if (user) {
      fetch(`/api/wishlist?userId=${user.id}&productId=${productId}`, {
        method: 'POST'
      }).catch(err => console.error('Wishlist sync error:', err));
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
