import { Skia } from '@shopify/react-native-skia';

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
