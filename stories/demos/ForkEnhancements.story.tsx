import React, { useRef, useState } from 'react';
import { GraphCanvas, GraphCanvasRef, useSelection, lightTheme } from '../../src';
import { CircularImage } from '../../src/symbols';
import { GraphNode, GraphEdge } from '../../src/types';

export default {
  title: 'Demos/ForkEnhancements',
  component: GraphCanvas
};

// Sample nodes with real US President images to demonstrate texture filtering
const presidentNodes: GraphNode[] = [
  {
    id: 'lincoln',
    label: 'Abraham Lincoln',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg/220px-Abraham_Lincoln_O-77_matte_collodion_print.jpg',
    data: { era: 'civil_war', priority: 'high', importance: 10 }
  },
  {
    id: 'washington',
    label: 'George Washington',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg/220px-Gilbert_Stuart_Willstown_Portrait_of_George_Washington.jpg',
    data: { era: 'founding', priority: 'normal', importance: 8 }
  },
  {
    id: 'jefferson',
    label: 'Thomas Jefferson',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/T_Jefferson_by_Charles_Willson_Peale_1791_2.jpg/220px-T_Jefferson_by_Charles_Willson_Peale_1791_2.jpg',
    data: { era: 'founding', priority: 'critical', importance: 9 }
  },
  {
    id: 'kennedy',
    label: 'John F. Kennedy',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/John_F._Kennedy%2C_White_House_color_photo_portrait.jpg/220px-John_F._Kennedy%2C_White_House_color_photo_portrait.jpg',
    data: { era: 'modern', priority: 'medium', importance: 7 }
  },
  {
    id: 'roosevelt',
    label: 'Franklin D. Roosevelt',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/FDR_1944_Color_Portrait.jpg/220px-FDR_1944_Color_Portrait.jpg',
    data: { era: 'great_depression', priority: 'high', importance: 8 }
  }
];

const presidentEdges: GraphEdge[] = [
  { id: 'lincoln-washington', source: 'lincoln', target: 'washington', label: 'Civil War Era', data: { weight: 8 } },
  { id: 'lincoln-jefferson', source: 'lincoln', target: 'jefferson', label: 'Founding Influence', data: { weight: 6 } },
  { id: 'washington-kennedy', source: 'washington', target: 'kennedy', label: 'Modern Leadership', data: { weight: 5 } },
  { id: 'jefferson-kennedy', source: 'jefferson', target: 'kennedy', label: 'Democratic Tradition', data: { weight: 7 } },
  { id: 'lincoln-roosevelt', source: 'lincoln', target: 'roosevelt', label: 'Crisis Leadership', data: { weight: 9 } },
  { id: 'jefferson-roosevelt', source: 'jefferson', target: 'roosevelt', label: 'Progressive Ideas', data: { weight: 6 } }
];

// Enhanced theme showcasing fork enhancements
const enhancedTheme = {
  ...lightTheme,
  canvas: { background: '#f8f9fa' },
  edge: {
    ...lightTheme.edge,
    // Dynamic edge colors based on historical era - FORK ENHANCEMENT #1
    fill: (edge: any) => {
      if (!edge) return '#999';
      const sourceNode = presidentNodes.find(n => n.id === edge.source);
      const era = sourceNode?.data?.era;
      switch (era) {
      case 'founding': return '#2E8B57'; // Sea Green
      case 'civil_war': return '#8B0000'; // Dark Red
      case 'great_depression': return '#DAA520'; // Golden Rod
      case 'modern': return '#4169E1'; // Royal Blue
      default: return '#999';
      }
    },
    label: {
      ...lightTheme.edge.label,
      // Dynamic font sizes based on edge weight - FORK ENHANCEMENT #1
      fontSize: (edge: any) => {
        if (!edge) return 6;
        return Math.max(6, Math.min(10, (edge.data?.weight || 5) * 0.5));
      }
    }
  },
  node: {
    ...lightTheme.node,
    label: {
      ...lightTheme.node.label,
      // Clean styling like edge labels - remove background, thinner stroke
      background: 'transparent',
      backgroundOpacity: 0,
      color: '#2A6475', // Same color as edge labels
      stroke: '#fff', // White stroke for better contrast
      strokeWidth: 0.5, // Thinner stroke for cleaner look
      padding: 1, // Less padding for tighter appearance
      // Smaller, consistent font size like edge labels
      fontSize: (node: any) => {
        if (!node) return 6;
        return Math.max(6, Math.min(10, (node.data?.importance || 5) * 0.4));
      }
    }
  }
};

export const ForkEnhancementsShowcase = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const [selectionStyle, setSelectionStyle] = useState<'default' | 'custom'>('default');
  const [borderStyle, setBorderStyle] = useState<'none' | 'static' | 'dynamic'>('none');

  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: presidentNodes,
    edges: presidentEdges,
    type: 'multi'
  });

  const getCircularImageProps = (props: any) => {
    const baseProps = {
      ...props,
      image: props.node.icon || ''
    };

    // Selection styling
    if (selectionStyle === 'custom') {
      Object.assign(baseProps, {
        selectionHighlightColor: '#FF6B6B',
        selectionBorderWidth: 12,
        selectionBorderOpacity: 0.9,
        selectionPulseAnimation: true,
        selectionRingInnerRadius: 3.5,
      });
    }

    // Border styling
    if (borderStyle === 'static') {
      Object.assign(baseProps, {
        borderEnabled: true,
        borderColor: '#00008B',
        borderThickness: 3,
        borderOpacity: 0.8
      });
    } else if (borderStyle === 'dynamic') {
      Object.assign(baseProps, {
        borderEnabled: (node: any) => node?.data?.priority === 'high' || node?.data?.priority === 'critical',
        borderColor: (node: any) => {
          if (!node) return '#999';
          switch (node.data?.priority) {
          case 'critical': return '#FF4444';
          case 'high': return '#FF8800';
          default: return '#4A90E2';
          }
        },
        borderThickness: (node: any) => {
          if (!node) return 6;
          switch (node.data?.priority) {
          case 'critical': return 12;
          case 'high': return 10;
          default: return 8;
          }
        },
        borderOpacity: 0.9
      });
    }

    return baseProps;
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Fork Enhancements Demo</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: '#555' }}>
            <input
              type="radio"
              name="selectionStyle"
              checked={selectionStyle === 'default'}
              onChange={() => setSelectionStyle('default')}
              style={{ marginRight: '8px' }}
            />
            Default Selection
          </label>
          <label style={{ fontSize: '14px', color: '#555' }}>
            <input
              type="radio"
              name="selectionStyle"
              checked={selectionStyle === 'custom'}
              onChange={() => setSelectionStyle('custom')}
              style={{ marginRight: '8px' }}
            />
            Custom Selection Styling
          </label>
        </div>

        <div style={{ marginTop: '15px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>Border Options:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#555' }}>
              <input
                type="radio"
                name="borderStyle"
                checked={borderStyle === 'none'}
                onChange={() => setBorderStyle('none')}
                style={{ marginRight: '8px' }}
              />
              No Borders
            </label>
            <label style={{ fontSize: '13px', color: '#555' }}>
              <input
                type="radio"
                name="borderStyle"
                checked={borderStyle === 'static'}
                onChange={() => setBorderStyle('static')}
                style={{ marginRight: '8px' }}
              />
              Static Blue Border
            </label>
            <label style={{ fontSize: '13px', color: '#555' }}>
              <input
                type="radio"
                name="borderStyle"
                checked={borderStyle === 'dynamic'}
                onChange={() => setBorderStyle('dynamic')}
                style={{ marginRight: '8px' }}
              />
              Dynamic Priority Borders
            </label>
          </div>
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#777' }}>
          <strong>Features:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Texture-filtered circular images</li>
            <li>Dynamic theme callbacks</li>
            <li>Clean node labels (edge-style appearance)</li>
            <li>Multi-select & drag-and-drop</li>
            <li>Custom selection highlighting</li>
            <li>Configurable node borders (contained within image bounds)</li>
            <li>Dynamic border callbacks</li>
          </ul>
        </div>
      </div>

      {/* Graph Canvas */}
      <GraphCanvas
        ref={graphRef}
        nodes={presidentNodes}
        edges={presidentEdges}
        theme={enhancedTheme}
        layoutType="forceatlas2"
        labelType="all"
        edgeLabelPosition="inline"
        selections={selections}
        draggable={true}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
        renderNode={(props: any) => (
          <CircularImage {...getCircularImageProps(props)} />
        )}
      />
    </div>
  );
};