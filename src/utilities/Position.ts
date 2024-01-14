export function getPageCoorinates(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const pageX = rect.left + rect.width / 2 + window.scrollX;
  const pageY = rect.top + rect.height / 2 + window.scrollY;
  const pageRight = rect.right + window.scrollX;
  const pageLeft = rect.left + window.scrollX;
  const pageTop = rect.top + window.scrollY;
  const width = rect.width;
  const height = rect.height;
  return {
    x: pageX,
    y: pageY,
    right: pageRight,
    top: pageTop,
    left: pageLeft,
    width: width,
    height: height,
  };
}
