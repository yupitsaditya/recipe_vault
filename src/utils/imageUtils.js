export const compressImage = (base64Str) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width, height = img.height;
      if (width > height) { 
        if (width > 800) { height *= 800 / width; width = 800; } 
      } else { 
        if (height > 800) { width *= 800 / height; height = 800; } 
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
};
