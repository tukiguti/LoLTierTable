import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';

export const useChampionData = () => {
  const { champions, loading, setChampions, setLoading } = useAppStore();

  useEffect(() => {
    const loadChampions = async () => {
      if (champions.length > 0) return; // Already loaded

      setLoading(true);
      try {
        const championData = await api.fetchChampions();
        setChampions(championData);
        
        // Preload some champion images for better UX
        api.preloadChampionImages(championData);
      } catch (error) {
        console.error('Failed to load champion data:', error);
        // You could add error handling UI here
      } finally {
        setLoading(false);
      }
    };

    loadChampions();
  }, [champions.length, setChampions, setLoading]);

  return { champions, loading };
};