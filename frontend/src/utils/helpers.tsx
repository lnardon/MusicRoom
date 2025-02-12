/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

export function HandleFallbackImage(
  url: string,
  className: string,
  ref?: any,
  styles?: any
): any {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(url, {
          headers: {
            Authorization: `${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to load image");

        const blob = await response.blob();
        setImageSrc(URL.createObjectURL(blob));
      } catch (error) {
        console.error(error);
        setImageSrc(null);
      }
    };

    if (url) fetchImage();
  }, [url]);

  return (
    <img
      src={imageSrc || "/assets/vinyl_placeholder.webp"}
      alt="cover image"
      className={className}
      ref={ref}
      style={styles}
    />
  );
}
