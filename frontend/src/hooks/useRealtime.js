// ============================================================
// FILE: src/hooks/useRealtime.js
// Supabase Realtime subscription for new property inserts
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * Subscribe to real-time property inserts.
 * Optionally filters by user's preferred areas.
 * 
 * @param {object} options
 * @param {string[]} options.preferredAreas - User's preferred areas to watch
 * @param {function} options.onNewProperty - Callback when a matching property arrives
 * @returns {{ newProperty, clearNotification }}
 */
export function useRealtime({ preferredAreas = [], onNewProperty } = {}) {
  const [newProperty, setNewProperty] = useState(null);
  const channelRef = useRef(null);

  const clearNotification = useCallback(() => {
    setNewProperty(null);
  }, []);

  useEffect(() => {
    // Subscribe to INSERT events on the properties table
    const channel = supabase
      .channel('properties-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'properties',
        },
        (payload) => {
          const property = payload.new;
          console.log('🔔 New property inserted:', property);

          // Check if the new property matches user's preferred areas
          const matchesArea = 
            preferredAreas.length === 0 || 
            preferredAreas.includes(property.area);

          if (matchesArea) {
            setNewProperty(property);

            // Call the callback if provided
            if (onNewProperty) {
              onNewProperty(property);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [preferredAreas, onNewProperty]);

  return { newProperty, clearNotification };
}

export default useRealtime;
