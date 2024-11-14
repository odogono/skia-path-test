import { SkRect, Skia } from '@shopify/react-native-skia';

export const centerSVGPath = (svgPath: string): string => {
  // Create a path from the SVG string
  const path = Skia.Path.MakeFromSVGString(svgPath);
  if (!path) {
    throw new Error('Invalid SVG path string');
  }

  // Get the bounds of the path
  const bounds = path.getBounds();

  // Calculate the center of the bounds
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;

  // Create a new path that's translated to center at 0,0
  const centeredPath = path.transform(
    Skia.Matrix().translate(-centerX, -centerY)
  );

  // Convert back to SVG string
  return centeredPath.toSVGString();
};

export const fitSVGPathToBounds = (svgPath: string, bounds: SkRect): string => {
  // Create a path from the SVG string
  const path = Skia.Path.MakeFromSVGString(svgPath);
  if (!path) {
    throw new Error('Invalid SVG path string');
  }

  // Get the current bounds of the path
  const pathBounds = path.getBounds();

  // Calculate scale factors for width and height
  const scaleX = bounds.width / pathBounds.width;
  const scaleY = bounds.height / pathBounds.height;

  // Use the smaller scale factor to maintain aspect ratio
  const scale = Math.min(scaleX, scaleY);

  // Calculate translation to center the path in the bounds
  const scaledWidth = pathBounds.width * scale;
  const scaledHeight = pathBounds.height * scale;
  const translateX = bounds.x + (bounds.width - scaledWidth) / 2;
  const translateY = bounds.y + (bounds.height - scaledHeight) / 2;

  // Create a new path that's scaled and translated
  const transformedPath = path.transform(
    Skia.Matrix()
      .scale(scale, scale)
      .translate(
        translateX / scale - pathBounds.x,
        translateY / scale - pathBounds.y
      )
  );

  // Convert back to SVG string
  return transformedPath.toSVGString();
};
