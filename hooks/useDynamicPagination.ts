import { useState, useEffect } from 'react';

interface UseDynamicPaginationOptions {
  // Número de columnas en diferentes breakpoints de Tailwind
  cols: {
    mobile: number;    // cols para sm (< 640px)
    md: number;        // cols para md (>= 768px)
    lg: number;        // cols para lg (>= 1024px) 
    xl: number;        // cols para xl (>= 1280px)
    '2xl'?: number;    // cols para 2xl (>= 1536px)
  };
  // Límite móvil de elementos totales (incluyendo botón)
  mobileLimit: number;
  // Número de filas para desktop
  rows?: number;
}

export const useDynamicPagination = ({
  cols,
  mobileLimit,
  rows = 2,
}: UseDynamicPaginationOptions) => {
  const [pageSize, setPageSize] = useState<number>(mobileLimit);
  const [isMobile, setIsMobile] = useState<boolean>(true);

  useEffect(() => {
    const calculatePageSize = () => {
      const width = window.innerWidth;
      let columns = cols.mobile;
      let mobile = true;

      if (width >= 1536 && cols['2xl']) {
        columns = cols['2xl'];
        mobile = false;
      } else if (width >= 1280) {
        columns = cols.xl;
        mobile = false;
      } else if (width >= 1024) {
        columns = cols.lg;
        mobile = false;
      } else if (width >= 768) {
        columns = cols.md;
        mobile = false;
      } else {
        columns = cols.mobile;
        mobile = true;
      }

      setIsMobile(mobile);
      
      if (mobile) {
        // En mobile, usar el límite fijo
        setPageSize(mobileLimit);
      } else {
        // En desktop, calcular basado en filas × columnas
        const itemsPerPage = columns * rows;
        setPageSize(itemsPerPage);
      }
    };

    // Calcular inicialmente
    calculatePageSize();

    // Recalcular en resize
    window.addEventListener('resize', calculatePageSize);
    return () => window.removeEventListener('resize', calculatePageSize);
  }, [cols, mobileLimit, rows]);

  return { pageSize, isMobile };
};