/* eslint-disable @typescript-eslint/no-explicit-any */
export function HandleFallbackImage(
  url: string,
  className: string,
  ref?: any,
  styles?: any
): any {
  return (
    <object
      type="image/jpeg"
      data={url}
      aria-label="This image should exist, but alas it does not"
      className={className}
      ref={ref}
      style={styles}
    >
      <img
        src="/assets/vinyl_placeholder.webp"
        alt="cover image"
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </object>
  );
}

export function urlHistoryHandler(
  key: string,
  value: string,
  setUrl: (url: string) => void
) {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(key, searchParams.get(key) === value ? "" : value);
  window.history.pushState(
    {},
    "",
    `${window.location.pathname}?${searchParams.toString()}`
  );
  setUrl(window.location.search);
}
