# 3D Body Model Component

This modular component provides an interactive 3D human body model for pain assessment and visualization.

## Structure

The component has been modularized into the following files:

- `index.js` - Main component that integrates all parts
- `anatomyData.js` - Contains anatomical data like body regions, pain points, and region determination logic
- `constants.js` - Defines constants like pain colors and utility functions for color generation
- `utils.js` - Utility functions for 3D interactions, pain point creation, and data formatting
- `visualizers.js` - React components for visualizing pain points, regions, and interactions

## Features

- Interactive 3D human body model
- Click on body regions to add pain points
- Filter pain points by body region
- Adjust pain levels with a slider
- Add notes to pain points
- Debug mode for visualizing anatomical regions
- Detailed anatomical labeling with medical terminology

## Usage

```jsx
import BodyModel3D from '../components/BodyModel3D';

const MyComponent = () => {
  const handlePainDataChange = (painPoints) => {
    console.log('Pain points updated:', painPoints);
    // Process pain data as needed
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <BodyModel3D 
        onChange={handlePainDataChange} 
        disabled={false} 
      />
    </div>
  );
};
```

## Props

- `onChange` - Callback function that receives updated pain points data
- `disabled` - Boolean to disable interactions with the model

## Pain Point Data Structure

Each pain point has the following structure:

```js
{
  id: 'unique_id',
  label: 'Anatomical Label',
  region: 'anatomical_region',
  position: [x, y, z], // 3D coordinates
  painLevel: 5, // 0-10 scale
  notes: 'User notes about the pain',
  medicalTerm: 'Medical terminology' // When available
}
```

## Anatomical Regions

The model supports the following anatomical regions:
- Head
- Neck
- Shoulders
- Chest
- Back
- Arms
- Abdomen
- Hips
- Legs
- Feet

## Debug Mode

The component includes a debug mode that can be activated by clicking the bug icon. Debug levels:

1. Basic hover info - Shows anatomical region on hover
2. Region boundaries - Visualizes front/back planes
3. All zone visualizers - Shows all anatomical region boundaries

## Dependencies

- React
- Three.js
- React Three Fiber
- React Three Drei
- Material UI 