# Reagraph Copilot Instructions

## Repository Status: Fork with Enhancements

**Important**: This is a fork of the original [reagraph](https://github.com/reaviz/reagraph) library with specific theme callback enhancements. See [FORK_CHANGES.md](../FORK_CHANGES.md) for details on what's unique about this fork.

### Key Fork Enhancements
- **Dynamic Theme Callbacks**: Edge/node colors and font sizes can be functions based on data
- **Enhanced Node Labels**: Support for `background` property on node labels
- **Theme Helper Functions**: `getEdgeThemeColor()`, `getEdgeThemeNumber()`, `getNodeThemeNumber()`
- **Backward Compatibility**: All changes maintain compatibility with upstream reagraph

## Project Overview
Reagraph is a high-performance WebGL network graph visualization library for React, built with Three.js and React Three Fiber. It provides interactive 2D/3D graph rendering with support for multiple layout algorithms, node clustering, edge bundling, and advanced interaction modes.

## Core Architecture

### Primary Components
- **GraphCanvas** (`src/GraphCanvas/`) - Main React component wrapping React Three Fiber Canvas
- **GraphScene** (`src/GraphScene.tsx`) - Core 3D scene management and rendering logic
- **Store** (`src/store.ts`) - Zustand-based global state management for graph interactions
- **Layout System** (`src/layout/`) - 15+ graph layout algorithms (force-directed, circular, hierarchical, etc.)

### Data Flow
1. Graph data (nodes/edges) → Layout algorithms → Positioned elements
2. Positioned data → Three.js objects → React Three Fiber rendering
3. User interactions → Zustand store → State updates → Re-renders

### Key Systems
- **Symbol System** (`src/symbols/`) - Renderable elements (nodes, edges, clusters, labels)
- **Camera Controls** (`src/CameraControls/`) - 3D navigation and interaction
- **Selection System** (`src/selection/`) - Node selection with lasso and click interactions
- **Sizing System** (`src/sizing/`) - Dynamic node sizing (attribute, centrality, PageRank, custom)
- **Theme System** (`src/themes/`) - Light/dark themes with customizable styling

## Development Workflows

### Core Commands
```bash
npm start              # Start Storybook dev server (port 9009)
npm run build          # Build library + docs for production
npm test               # Run Vitest tests
npm run test:coverage  # Run tests with coverage
npm run lint           # ESLint TypeScript files
npm run lint:fix       # Auto-fix ESLint issues
npm run prettier       # Format code with Prettier
```

### Build System
- **Vite** with dual modes: library (NPM package) and development (Storybook)
- **TypeScript** with loose strict mode (`"strict": false`)
- **CSS Modules** for component styling
- **SVG imports** via vite-plugin-svgr
- **Dual exports**: ESM + CommonJS for maximum compatibility

## Code Patterns & Conventions

### Component Structure
```typescript
// Component props interface (always ends with Props)
interface NodeProps {
  id: string;
  label?: string;
  // ... other props
}

// Functional component with destructured defaults
const Node: FC<NodeProps> = ({
  id,
  label = 'Node',
  // ... other props with defaults
}) => {
  // Component logic
};
```

### State Management (Zustand)
```typescript
// Store interface with actions
interface GraphState {
  nodes: InternalGraphNode[];
  setNodes: (nodes: InternalGraphNode[]) => void;
  // ... other state and actions
}

// Create store with factory pattern
export const createStore = (initialState) =>
  create<GraphState>(set => ({
    // State initialization
    nodes: [],
    // Actions with immutable updates
    setNodes: nodes => set(state => ({ ...state, nodes })),
  }));

// Use store with shallow comparison for performance
const useGraphState = () => useStore(useShallow(selector));
```

### React Three Fiber Integration
```typescript
// Access Three.js context
const { camera, raycaster, size, gl } = useThree();

// Handle Three.js events
const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
  // Event handling logic
};
```

### Animation Patterns
```typescript
// React Spring animations with consistent config
const { position } = useSpring({
  position: [x, y, z],
  config: animationConfig
});

// Prevent zero values in scale animations
const scale = useSpring({
  scale: isVisible ? [1, 1, 1] : [0.00001, 0.00001, 0.00001],
  config: animationConfig
});
```

### Performance Optimizations
```typescript
// Extensive useMemo for expensive calculations
const processedData = useMemo(() => {
  return expensiveCalculation(nodes, edges);
}, [nodes, edges]);

// useCallback for event handlers
const handleClick = useCallback((event) => {
  // Event logic
}, [dependencies]);

// Store refs for drag operations during animations
const dragRef = useRef({ x: 0, y: 0 });
```

### Layout System Architecture
```typescript
// Layout provider abstraction
export function layoutProvider({ type, ...config }): LayoutStrategy {
  switch (type) {
    case 'forceDirected2d':
      return forceDirected({
        dimensions: 2,
        nodeStrength: -250,
        // ... specific config
      });
    // ... other layout types
  }
}

// Layout strategy interface
interface LayoutStrategy {
  step: (graph: Graph) => boolean;
  assign: (graph: Graph) => void;
}
```

### TypeScript Patterns
- **Internal types** prefixed with `InternalGraph*` (e.g., `InternalGraphNode`)
- **Props interfaces** always end with `Props` suffix
- **Functional components** use `FC<Props>` type
- **Destructured props** with defaults in parameter list
- **Relative imports** for internal modules

## Fork-Specific Features

### Dynamic Theme Callbacks (Fork Enhancement)
```typescript
// Edge colors can be functions based on edge data
const theme = {
  edge: {
    fill: (edge) => edge.data?.priority === 'high' ? 'red' : 'blue',
    label: {
      fontSize: (edge) => edge.data?.weight * 10 || 12
    }
  },
  node: {
    label: {
      fontSize: (node) => node.data?.importance * 8 || 12
    }
  }
};

// Use theme helper functions for type safety
import { getEdgeThemeColor, getEdgeThemeNumber, getNodeThemeNumber } from '../themes';

const edgeColor = getEdgeThemeColor(theme.edge.fill, edge);
const edgeFontSize = getEdgeThemeNumber(theme.edge.label.fontSize, edge);
const nodeFontSize = getNodeThemeNumber(theme.node.label.fontSize, node);
```

### Enhanced Node Label Backgrounds (Fork Enhancement)
```typescript
// Node labels support background property
const theme = {
  node: {
    label: {
      background: 'rgba(255, 255, 255, 0.8)', // New in fork
      backgroundColor: 'white', // Backward compatibility
      color: '#333',
      stroke: '#000',
      strokeWidth: 0.5,
      padding: 4
    }
  }
};
```

### File Organization
```
src/
├── ComponentName/           # Feature directory
│   ├── ComponentName.tsx    # Main component
│   ├── index.ts            # Barrel exports
│   └── utils.ts            # Component utilities
├── utils/                  # Shared utilities
│   ├── geometry.ts         # Math/geometry helpers
│   ├── animation.ts        # Animation utilities
│   └── index.ts           # Barrel exports
```

### Testing Conventions
```typescript
// Vitest with describe/test pattern
describe('geometry utils', () => {
  test('should calculate distance correctly', () => {
    expect(calculateDistance(p1, p2)).toBe(expected);
  });
});

// Focus on mathematical utilities and business logic
// Test files: *.test.ts suffix
```

## Key Dependencies & Integration Points

### Core Libraries
- **React Three Fiber** - React renderer for Three.js
- **Three.js** - WebGL 3D graphics engine
- **Zustand** - Lightweight state management
- **React Spring** - Animation library for 3D objects
- **Graphology** - Graph data structure and algorithms
- **D3 modules** - Layout calculations and data manipulation

### External Integrations
- **camera-controls** - 3D camera interaction library
- **@use-gesture/react** - Multi-touch gesture handling
- **@react-three/drei** - Useful Three.js helpers
- **three-stdlib** - Additional Three.js utilities

## Common Patterns & Gotchas

### Event Handling
- Use `useCallback` for event handlers passed as props
- Implement hover intent patterns to prevent accidental triggers
- Guard event handlers with `disabled` checks
- Use gesture library for complex drag interactions

### Animation Edge Cases
- Prevent division by zero in scale animations
- Use `useShallow` for Zustand selectors to avoid unnecessary re-renders
- Batch state updates during drag operations
- Store transient state in refs during animations

### Layout Considerations
- Force-directed layouts have different defaults for 2D vs 3D
- Tree layouts use `nodeLevelRatio` for level spacing
- Circular layouts work best with balanced node distributions
- Custom layouts can extend the `LayoutStrategy` interface

### Performance Tips
- Memoize expensive calculations with `useMemo`
- Use `useRef` for values that shouldn't trigger re-renders
- Batch DOM updates during animations
- Profile Three.js rendering with `stats.js` in development

## Development Best Practices

### When Adding New Features
1. Create feature directory with `index.ts` barrel exports
2. Add TypeScript interfaces with `Props` suffix
3. Use `useMemo`/`useCallback` for performance
4. Add comprehensive prop types and JSDoc comments
5. Test mathematical logic and edge cases
6. Follow existing naming conventions

### When Modifying Existing Code
1. Preserve existing API compatibility
2. Update TypeScript types when changing interfaces
3. Maintain performance optimization patterns
4. Test across different layout types
5. Update documentation and examples

### Fork-Specific Development Notes
1. **Theme Callbacks**: When adding new theme properties, consider if they should support callback functions
2. **Backward Compatibility**: Always maintain compatibility with upstream reagraph API
3. **Helper Functions**: Use the theme helper functions (`getEdgeThemeColor`, etc.) for consistent behavior
4. **Type Safety**: Ensure callback functions receive proper TypeScript typing for edge/node parameters

### Debugging Tips
- Use React DevTools for component hierarchy
- Use Three.js dev tools for 3D scene inspection
- Check browser console for WebGL errors
- Profile performance with browser dev tools
- Use `stats.js` for frame rate monitoring