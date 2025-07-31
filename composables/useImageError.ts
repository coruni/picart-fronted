export const useImageError = () => {
  const handleImageError = (event: Event, type: 'avatar' | 'thumbnail' | 'general' = 'general') => {
    const img = event.target as HTMLImageElement;

    if (!img) return;

    // 根据暗黑模式选择不同的占位图
    const isDark = document.documentElement.classList.contains('dark')
    console.log(isDark);

    switch (type) {
      case 'avatar':
        img.src = isDark ? '/placeholder-dark.svg' : '/placeholder.svg';
        break;
      case 'thumbnail':
        img.src = isDark ? '/placeholder-dark.svg' : '/placeholder.svg';
        break;
      default:
        img.src = isDark ? '/placeholder-dark.svg' : '/placeholder.svg';
    }

    // 防止循环错误
    img.onerror = null;
  };

  return {
    handleImageError
  };
};
