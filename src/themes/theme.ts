import { ColorRepresentation } from 'three';
import { GraphEdge, GraphNode } from 'types';

export interface Theme {
  canvas?: {
    background?: ColorRepresentation;
    fog?: ColorRepresentation | null;
  };
  node: {
    fill: ColorRepresentation;
    activeFill: ColorRepresentation;
    opacity: number;
    selectedOpacity: number;
    inactiveOpacity: number;
    label: {
      fontSize?: number | ((edge?: GraphEdge) => number);
      color: ColorRepresentation;
      stroke?: ColorRepresentation;
      activeColor: ColorRepresentation;
      background: ColorRepresentation;
    };
    subLabel?: {
      color: ColorRepresentation;
      stroke?: ColorRepresentation;
      activeColor: ColorRepresentation;
    };
  };
  ring: {
    fill: ColorRepresentation;
    activeFill: ColorRepresentation;
  };
  edge: {
    fill: ColorRepresentation| ((edge?: GraphEdge) => ColorRepresentation);
    activeFill: ColorRepresentation;
    opacity: number;
    selectedOpacity: number;
    inactiveOpacity: number;
    label: {
      color: ColorRepresentation;
      stroke?: ColorRepresentation;
      activeColor: ColorRepresentation;
      fontSize?: number | ((edge?: GraphEdge) => number);
    };
  };
  arrow: {
    fill: ColorRepresentation| ((edge?: GraphEdge) => ColorRepresentation);
    activeFill: ColorRepresentation;
  };
  lasso: {
    background: string;
    border: string;
  };
  cluster?: {
    stroke?: ColorRepresentation;
    fill?: ColorRepresentation;
    opacity?: number;
    selectedOpacity?: number;
    inactiveOpacity?: number;
    label?: {
      stroke?: ColorRepresentation;
      color: ColorRepresentation;
    };
  };
}

export const getEdgeThemeColor = (colorValue: ColorRepresentation | ((edge?: GraphEdge) => ColorRepresentation), edge?: GraphEdge) => {
    if (typeof colorValue === 'function') {
        return colorValue(edge)
    } 

    return colorValue;
}

export const getEdgeThemeNumber = (value?: number | ((edge?: GraphEdge) => number), edge?: GraphEdge) => {
    if (typeof value === 'function') {
        return value(edge)
    } 

    return value;
}

export const getNodeThemeNumber = (value?: number | ((node?: GraphNode) => number), node?: GraphNode) => {
    if (typeof value === 'function') {
        return value(node)
    } 

    return value;
}