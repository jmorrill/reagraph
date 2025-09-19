import React, { FC, useMemo, useState, useEffect } from 'react';
import { a, useSpring } from '@react-spring/three';
import { TextureLoader, Color, LinearFilter, ShaderMaterial } from 'three';
import { animationConfig } from '../../utils/animation';
import { NodeRendererProps, GraphNode } from '../../types';
import { Ring } from '../Ring';

export interface CircularImageProps extends NodeRendererProps {
  /**
   * The image to display on the sphere.
   */
  image: string;

  /**
   * The color of the selection highlight border.
   * @default '#FFD700' (gold)
   */
  selectionHighlightColor?: string;

  /**
   * The width of the selection highlight border.
   * @default 8
   */
  selectionBorderWidth?: number;

  /**
   * The opacity of the selection highlight border.
   * @default 0.8
   */
  selectionBorderOpacity?: number;

  /**
   * Whether to show a pulsing animation on selection.
   * @default true
   */
  selectionPulseAnimation?: boolean;

  /**
   * The inner radius of the selection ring.
   * @default 4
   */
  selectionRingInnerRadius?: number;

  /**
   * Whether to show a border around the circular image.
   * Can be a boolean or a function that receives the node data.
   * @default false
   */
  borderEnabled?: boolean | ((node: GraphNode) => boolean);

  /**
   * The color of the border.
   * Can be a color string or a function that receives the node data.
   * @default '#000000'
   */
  borderColor?: string | ((node: GraphNode) => string);

  /**
   * The thickness of the border.
   * Can be a number or a function that receives the node data.
   * @default 2
   */
  borderThickness?: number | ((node: GraphNode) => number);

  /**
   * The opacity of the border.
   * Can be a number or a function that receives the node data.
   * @default 1.0
   */
  borderOpacity?: number | ((node: GraphNode) => number);

  /**
   * The inner radius of the border ring.
   * This is automatically calculated to keep the border within the image bounds.
   * Can be a number or a function that receives the node data.
   * @default 0.8
   */
  borderInnerRadius?: number | ((node: GraphNode) => number);
}

// SVG placeholder for person icon
const PERSON_PLACEHOLDER_SVG = `
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" fill="#CBD5E0"/>
    <path d="M6 21c0-4 3-7 6-7s6 3 6 7" stroke="#CBD5E0" stroke-width="2" stroke-linecap="round"/>
  </svg>
`;

// Convert SVG to data URL for texture
const svgToDataUrl = (svg: string) => {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

interface ImageLoadState {
  isLoading: boolean;
  hasLoaded: boolean;
  hasError: boolean;
  aspectRatio: number;
}

export const CircularImage: FC<CircularImageProps> = ({
  image,
  color,
  id,
  size,
  selected,
  opacity = 1,
  animated,
  selectionHighlightColor = '#FFD700',
  selectionBorderWidth = 8,
  selectionBorderOpacity = 0.8,
  selectionPulseAnimation = true,
  selectionRingInnerRadius = 4,
  borderEnabled = false,
  borderColor = '#000000',
  borderThickness = 2,
  borderOpacity = 1.0,
  borderInnerRadius = 0.8,
  node
}) => {
  const [loadState, setLoadState] = useState<ImageLoadState>({
    isLoading: true,
    hasLoaded: false,
    hasError: false,
    aspectRatio: 1.0
  });

  // Create placeholder texture
  const placeholderTexture = useMemo(() => {
    const loader = new TextureLoader();
    const tex = loader.load(svgToDataUrl(PERSON_PLACEHOLDER_SVG));
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    return tex;
  }, []);

  // Create main image texture (loads asynchronously)
  const imageTexture = useMemo(() => {
    if (!image) return placeholderTexture;

    setLoadState(prev => ({
      ...prev,
      isLoading: true,
      hasLoaded: false,
      hasError: false
    }));

    const loader = new TextureLoader();
    const tex = loader.load(
      image,
      // onLoad
      () => {
        // Get aspect ratio from the actual image
        const img = new Image();
        img.onload = () => {
          const ratio = img.naturalWidth / img.naturalHeight;
          setLoadState({
            isLoading: false,
            hasLoaded: true,
            hasError: false,
            aspectRatio: ratio
          });
        };
        img.src = image;
      },
      // onProgress
      undefined,
      // onError
      () => {
        setLoadState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true
        }));
      }
    );

    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    return tex;
  }, [image, placeholderTexture]);

  // Create shader material that handles both placeholder and actual image
  const shaderMaterial = useMemo(() => {
    const currentTexture = loadState.hasLoaded
      ? imageTexture
      : placeholderTexture;
    const currentAspectRatio = loadState.hasLoaded
      ? loadState.aspectRatio
      : 1.0;

    return new ShaderMaterial({
      uniforms: {
        map: { value: currentTexture },
        opacity: { value: opacity },
        color: { value: new Color(color) },
        aspectRatio: { value: currentAspectRatio },
        isPlaceholder: { value: !loadState.hasLoaded ? 1.0 : 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float opacity;
        uniform vec3 color;
        uniform float aspectRatio;
        uniform float isPlaceholder;
        varying vec2 vUv;

        void main() {
          // Calculate distance from center for circular mask
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);

          // Create circular mask with smooth edges
          float mask = 1.0 - smoothstep(0.48, 0.5, dist);

          // Center UV coordinates
          vec2 uv = vUv - 0.5;

          if (isPlaceholder > 0.5) {
            // For placeholder: simple centered scaling
            uv *= 0.6; // Scale down placeholder icon
          } else {
            // For actual image: aspect-ratio-aware scaling to fill circle
            if (aspectRatio > 1.0) {
              // Wide image: scale to fill height, crop width
              uv.x /= aspectRatio;
            } else if (aspectRatio < 1.0) {
              // Tall image: scale to fill width, crop height
              uv.y *= aspectRatio;
            }
            // Scale to fill circle completely
            uv *= 0.95;
          }

          // Recenter
          uv += 0.5;

          // Clamp to prevent sampling outside texture
          uv = clamp(uv, 0.0, 1.0);

          // Sample texture
          vec4 texColor = texture2D(map, uv);

          // For placeholder, blend with background color
          if (isPlaceholder > 0.5) {
            vec3 bgColor = vec3(0.95, 0.95, 0.95); // Light gray background
            texColor.rgb = mix(bgColor, texColor.rgb, texColor.a);
          }

          // Use texture color if available, otherwise base color
          vec3 finalColor = texColor.a > 0.0 ? texColor.rgb : color;

          gl_FragColor = vec4(finalColor, mask * opacity);
        }
      `,
      transparent: true,
      fog: true
    });
  }, [imageTexture, placeholderTexture, opacity, color, loadState]);

  // Smooth transition animation when image loads
  const { imageOpacity, placeholderOpacity } = useSpring({
    imageOpacity: loadState.hasLoaded ? 1.0 : 0.0,
    placeholderOpacity: loadState.hasLoaded ? 0.0 : 1.0,
    config: {
      tension: 200,
      friction: 25
    }
  });

  // Resolve border values using callbacks and node data
  const resolvedBorderEnabled = useMemo(() => {
    if (typeof borderEnabled === 'function') {
      return borderEnabled(node);
    }
    return borderEnabled;
  }, [borderEnabled, node]);

  const resolvedBorderColor = useMemo(() => {
    if (typeof borderColor === 'function') {
      return borderColor(node);
    }
    return borderColor;
  }, [borderColor, node]);

  const resolvedBorderThickness = useMemo(() => {
    if (typeof borderThickness === 'function') {
      return borderThickness(node);
    }
    return borderThickness;
  }, [borderThickness, node]);

  const resolvedBorderOpacity = useMemo(() => {
    if (typeof borderOpacity === 'function') {
      return borderOpacity(node);
    }
    return borderOpacity;
  }, [borderOpacity, node]);

  const resolvedBorderInnerRadius = useMemo(() => {
    if (typeof borderInnerRadius === 'function') {
      return borderInnerRadius(node);
    }
    return borderInnerRadius;
  }, [borderInnerRadius, node]);

  const { scale, nodeOpacity, ringScale, ringOpacity } = useSpring({
    from: {
      scale: [0.00001, 0.00001, 0.00001],
      nodeOpacity: 0,
      ringScale: [0.00001, 0.00001, 0.00001],
      ringOpacity: 0
    },
    to: {
      scale: [size, size, size],
      nodeOpacity: opacity,
      ringScale: selected
        ? [size / 2, size / 2, 1]
        : [0.00001, 0.00001, 0.00001],
      ringOpacity: selected ? selectionBorderOpacity : 0
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });

  // Pulsing animation for selection
  const { pulseScale } = useSpring({
    from: { pulseScale: [1, 1, 1] },
    to: {
      pulseScale:
        selected && selectionPulseAnimation ? [1.1, 1.1, 1.1] : [1, 1, 1]
    },
    config: {
      tension: 200,
      friction: 10,
      duration: selected && selectionPulseAnimation ? 1000 : 0
    },
    loop: selected && selectionPulseAnimation ? { reverse: true } : false
  });

  return (
    <>
      <a.mesh userData={{ id, type: 'node' }} scale={scale as any}>
        <circleGeometry attach="geometry" args={[0.9, 64]} />
        <primitive attach="material" object={shaderMaterial} />
      </a.mesh>

      {/* Loading indicator */}
      {loadState.isLoading && (
        <a.mesh position={[0, 0, 0.1]} scale={[0.3, 0.3, 1]}>
          <ringGeometry attach="geometry" args={[0.8, 1.0, 8]} />
          <a.meshBasicMaterial
            attach="material"
            color="#4299e1"
            transparent={true}
            opacity={0.6}
          />
        </a.mesh>
      )}

      {/* Custom Border Ring */}
      {resolvedBorderEnabled && (
        <Ring
          innerRadius={Math.max(0.1, resolvedBorderInnerRadius)}
          size={size * 1.8}
          color={resolvedBorderColor}
          opacity={resolvedBorderOpacity}
          strokeWidth={resolvedBorderThickness}
          segments={64}
        />
      )}

      <a.group scale={pulseScale as any}>
        <Ring
          opacity={ringOpacity as any}
          size={size}
          animated={animated}
          color={selectionHighlightColor}
          strokeWidth={selectionBorderWidth}
          innerRadius={selectionRingInnerRadius}
          segments={64}
        />
      </a.group>
    </>
  );
};
