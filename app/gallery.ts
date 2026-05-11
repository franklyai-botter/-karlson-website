export const galleryImages = Array.from({ length: 44 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");

  return {
    src: `/karlson/gallery-full/foto-${number}.jpg`,
    alt: `Karlson Foto ${index + 1}`,
  };
});
