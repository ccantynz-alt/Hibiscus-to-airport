import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook that wraps React Router navigation with the View Transitions API.
 * Falls back to regular navigation in browsers that don't support it.
 */
export function useViewTransition() {
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((to, options) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate(to, options);
      });
    } else {
      navigate(to, options);
    }
  }, [navigate]);

  return navigateWithTransition;
}
