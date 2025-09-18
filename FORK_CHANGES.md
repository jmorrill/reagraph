# Reagraph Fork Changes

## Overview

This repository is a fork of the original [reagraph](https://github.com/reaviz/reagraph) library, maintained by jmorrill. This fork includes specific enhancements that extend the theming capabilities while maintaining compatibility with upstream changes.

## Key Enhancements

### 1. Dynamic Theme Callbacks

**What**: Enhanced theme system to support dynamic colors and sizes based on edge/node data.

**Changes**:
- Added `getEdgeThemeColor()` helper function for dynamic edge colors
- Added `getEdgeThemeNumber()` helper function for dynamic edge font sizes
- Added `getNodeThemeNumber()` helper function for dynamic node font sizes

**Usage**:
```typescript
// Edge colors can now be functions
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
```

### 2. Enhanced Node Label Background Support

**What**: Added `background` property to node labels for better readability.

**Changes**:
- Added `background` property to node label theme configuration
- Maintained backward compatibility with existing `backgroundColor` property
- Updated Label component to use the new background property

**Usage**:
```typescript
const theme = {
  node: {
    label: {
      background: 'rgba(255, 255, 255, 0.8)',
      // or use backgroundColor for backward compatibility
      backgroundColor: 'white'
    }
  }
};
```

### 3. Alternative Edge Implementation

**What**: Added `upstream_edge.tsx` as an alternative edge component implementation.

**Purpose**: This file serves as a reference implementation or backup edge component that may contain different approaches to edge rendering or additional features not yet integrated into the main codebase.

## Integration with Upstream

### Merge Strategy
- **Latest Integration**: Successfully merged upstream reagraph v4.30.4
- **Compatibility**: All changes maintain backward compatibility
- **Build Status**: All enhancements pass the build process

### Files Modified
The following files were updated to support the theme callback enhancements:

- `src/themes/theme.ts` - Added helper functions and updated type definitions
- `src/themes/darkTheme.ts` - Updated to use new theme structure
- `src/themes/lightTheme.ts` - Updated to use new theme structure
- `src/symbols/Edge.tsx` - Updated to use theme helper functions
- `src/symbols/Node.tsx` - Updated to use theme helper functions
- `src/symbols/Label.tsx` - Updated to support background property
- `src/symbols/edges/Edge.tsx` - Updated edge rendering logic
- `src/symbols/edges/Edges.tsx` - Updated edges container logic
- `src/symbols/edges/useEdgeGeometry.ts` - Updated geometry calculations
- `src/store.ts` - Updated store configuration for theme compatibility

## Benefits of This Fork

### 1. Data-Driven Theming
- Colors and sizes can be dynamically calculated based on graph data
- Enables more sophisticated visualizations with conditional styling
- Supports complex use cases like priority-based coloring or size-based importance

### 2. Enhanced Readability
- Node label backgrounds improve text readability over complex backgrounds
- Better visual hierarchy in dense graph layouts

### 3. Backward Compatibility
- All existing themes continue to work without modification
- Gradual migration path for adopting new features

## Usage Examples

### Dynamic Edge Coloring Based on Data
```typescript
const nodes = [
  { id: '1', label: 'High Priority', data: { priority: 'high' } },
  { id: '2', label: 'Normal Priority', data: { priority: 'normal' } }
];

const edges = [
  { id: '1-2', source: '1', target: '2', data: { weight: 5 } }
];

const theme = {
  edge: {
    fill: (edge) => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      return sourceNode?.data?.priority === 'high' ? '#ff4444' : '#4444ff';
    },
    label: {
      fontSize: (edge) => Math.max(8, edge.data?.weight || 10)
    }
  }
};
```

### Node Label Backgrounds
```typescript
const theme = {
  node: {
    label: {
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#333',
      stroke: '#000',
      strokeWidth: 0.5,
      padding: 4
    }
  }
};
```

## Development Notes

### Building with Enhancements
All changes are integrated into the standard build process:
```bash
npm run build  # Builds with all fork enhancements
npm start      # Starts dev server with enhanced theming
```

### Testing
- All existing tests pass with the new changes
- Theme helper functions include proper TypeScript typing
- Backward compatibility maintained for existing theme configurations

## Future Considerations

### Potential Upstream Integration
These enhancements could potentially be contributed back to the main reagraph repository if there's interest from the maintainers.

### Additional Features
The `upstream_edge.tsx` file may contain experimental features or alternative implementations that could be further developed or integrated.

## Contact

For questions about these fork-specific enhancements, please refer to the commit history or contact the fork maintainer.