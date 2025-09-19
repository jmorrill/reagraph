import React, { FC, useMemo } from 'react';
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

// Custom shader for circular masking
const circularShader = {
  uniforms: {
    map: { value: null },
    opacity: { value: 1.0 },
    color: { value: new Color() }
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
    varying vec2 vUv;

    void main() {
      // Calculate distance from center
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(vUv, center);

      // Create circular mask with smooth edges
      float mask = 1.0 - smoothstep(0.48, 0.5, dist);

      // Adjust UV coordinates to better utilize image space
      // Scale UV coordinates to use more of the texture
      vec2 scaledUv = (vUv - 0.5) * 1.2 + 0.5;

      // Clamp to texture bounds to prevent sampling outside
      scaledUv = clamp(scaledUv, 0.0, 1.0);

      // Sample texture with scaled coordinates
      vec4 texColor = texture2D(map, scaledUv);

      // Use texture color if available, otherwise use base color
      vec3 finalColor = texColor.a > 0.0 ? texColor.rgb : color;

      // Apply circular mask and overall opacity
      gl_FragColor = vec4(finalColor, mask * opacity);
    }
  `
};

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
  const texture = useMemo(() => {
    const loader = new TextureLoader();
    const tex = loader.load(image);
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    return tex;
  }, [image]);

  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        ...circularShader.uniforms,
        map: { value: texture },
        opacity: { value: opacity },
        color: { value: new Color(color) }
      },
      vertexShader: circularShader.vertexShader,
      fragmentShader: circularShader.fragmentShader,
      transparent: true,
      fog: true
    });
  }, [texture, opacity, color]);

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
        <planeGeometry attach="geometry" args={[1.8, 1.8]} />
        <primitive attach="material" object={shaderMaterial} />
      </a.mesh>

      {/* Custom Border Ring */}
      {resolvedBorderEnabled && (
        <Ring
          innerRadius={Math.max(0.1, resolvedBorderInnerRadius)}
          size={size * 1.8}
          color={resolvedBorderColor}
          opacity={resolvedBorderOpacity}
          strokeWidth={resolvedBorderThickness}
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
        />
      </a.group>
    </>
  );
};
