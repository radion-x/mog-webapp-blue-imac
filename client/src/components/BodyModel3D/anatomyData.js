// Available body regions for filtering
export const bodyRegions = [
  { id: 'all', label: 'All Regions' },
  { id: 'head', label: 'Head' },
  { id: 'neck', label: 'Neck' },
  { id: 'shoulder', label: 'Shoulders' },
  { id: 'back', label: 'Back' },
  { id: 'chest', label: 'Chest' },
  { id: 'arm', label: 'Arms' },
  { id: 'abdomen', label: 'Abdomen' },
  { id: 'hip', label: 'Hips' },
  { id: 'leg', label: 'Legs' },
  { id: 'foot', label: 'Feet' }
];

// Pre-defined pain points for the body model
export const painPoints = {
  // Head - adjusted for better proportions
  'head-top': { position: [0, 0.48, 0], label: 'Top of Head', region: 'head' },
  'head-front': { position: [0, 0.465, 0.0275], label: 'Forehead', region: 'head' },
  'head-back': { position: [0, 0.465, -0.0275], label: 'Back of Head', region: 'head' },
  'head-right': { position: [0.0275, 0.465, 0], label: 'Right Temple', region: 'head' },
  'head-left': { position: [-0.0275, 0.465, 0], label: 'Left Temple', region: 'head' },
  
  // Face - adjusted for better proportions
  'face-right': { position: [0.022, 0.45, 0.0165], label: 'Right Face', region: 'head' },
  'face-left': { position: [-0.022, 0.45, 0.0165], label: 'Left Face', region: 'head' },
  'jaw-right': { position: [0.022, 0.435, 0.0165], label: 'Right Jaw', region: 'head' },
  'jaw-left': { position: [-0.022, 0.435, 0.0165], label: 'Left Jaw', region: 'head' },
  
  // Neck - adjusted for better proportions
  'neck-front': { position: [0, 0.41, 0.0165], label: 'Throat', region: 'neck' },
  'neck-back': { position: [0, 0.41, -0.0165], label: 'Back of Neck', region: 'neck' },
  'neck-right': { position: [0.0165, 0.41, 0], label: 'Right Side of Neck', region: 'neck' },
  'neck-left': { position: [-0.0165, 0.41, 0], label: 'Left Side of Neck', region: 'neck' },
  
  // Shoulders - adjusted for better proportions
  'shoulder-right': { position: [0.055, 0.38, 0], label: 'Right Shoulder', region: 'shoulder' },
  'shoulder-left': { position: [-0.055, 0.38, 0], label: 'Left Shoulder', region: 'shoulder' },
  
  // Chest - adjusted for better proportions
  'chest-right': { position: [0.033, 0.35, 0.022], label: 'Right Chest', region: 'chest' },
  'chest-left': { position: [-0.033, 0.35, 0.022], label: 'Left Chest', region: 'chest' },
  'chest-center': { position: [0, 0.35, 0.022], label: 'Sternum', region: 'chest' },
  
  // Upper Back - adjusted for better proportions
  'upper-back-right': { position: [0.033, 0.35, -0.022], label: 'Right Upper Back', region: 'back' },
  'upper-back-left': { position: [-0.033, 0.35, -0.022], label: 'Left Upper Back', region: 'back' },
  'upper-back-center': { position: [0, 0.35, -0.022], label: 'Upper Spine', region: 'back' },
  
  // Arms - adjusted for better proportions
  'upper-arm-right': { position: [0.077, 0.34, 0], label: 'Right Upper Arm', region: 'arm' },
  'upper-arm-left': { position: [-0.077, 0.34, 0], label: 'Left Upper Arm', region: 'arm' },
  'elbow-right': { position: [0.077, 0.28, 0], label: 'Right Elbow', region: 'arm' },
  'elbow-left': { position: [-0.077, 0.28, 0], label: 'Left Elbow', region: 'arm' },
  'forearm-right': { position: [0.077, 0.22, 0], label: 'Right Forearm', region: 'arm' },
  'forearm-left': { position: [-0.077, 0.22, 0], label: 'Left Forearm', region: 'arm' },
  'wrist-right': { position: [0.077, 0.16, 0], label: 'Right Wrist', region: 'arm' },
  'wrist-left': { position: [-0.077, 0.16, 0], label: 'Left Wrist', region: 'arm' },
  'hand-right': { position: [0.077, 0.12, 0], label: 'Right Hand', region: 'arm' },
  'hand-left': { position: [-0.077, 0.12, 0], label: 'Left Hand', region: 'arm' },
  
  // Mid Torso - adjusted for better proportions
  'mid-abdomen': { position: [0, 0.3, 0.022], label: 'Mid Abdomen', region: 'abdomen' },
  'mid-back': { position: [0, 0.3, -0.022], label: 'Mid Back', region: 'back' },
  'side-right': { position: [0.044, 0.3, 0], label: 'Right Side', region: 'abdomen' },
  'side-left': { position: [-0.044, 0.3, 0], label: 'Left Side', region: 'abdomen' },
  
  // Lower Torso - adjusted for better proportions
  'lower-abdomen': { position: [0, 0.25, 0.022], label: 'Lower Abdomen', region: 'abdomen' },
  'lower-back': { position: [0, 0.25, -0.022], label: 'Lower Back', region: 'back' },
  
  // Hip/Pelvis - adjusted for better proportions
  'hip-right': { position: [0.044, 0.2, 0], label: 'Right Hip', region: 'hip' },
  'hip-left': { position: [-0.044, 0.2, 0], label: 'Left Hip', region: 'hip' },
  'groin': { position: [0, 0.19, 0.022], label: 'Pubic Region', region: 'hip' },
  'buttock-right': { position: [0.044, 0.19, -0.022], label: 'Right Buttock', region: 'hip' },
  'buttock-left': { position: [-0.044, 0.19, -0.022], label: 'Left Buttock', region: 'hip' },
  
  // Thighs - adjusted for better proportions
  'thigh-front-right': { position: [0.033, 0.15, 0.0165], label: 'Right Front Thigh', region: 'leg' },
  'thigh-front-left': { position: [-0.033, 0.15, 0.0165], label: 'Left Front Thigh', region: 'leg' },
  'thigh-back-right': { position: [0.033, 0.15, -0.0165], label: 'Right Back Thigh', region: 'leg' },
  'thigh-back-left': { position: [-0.033, 0.15, -0.0165], label: 'Left Back Thigh', region: 'leg' },
  
  // Knees - adjusted for better proportions
  'knee-right': { position: [0.033, 0.1, 0.0165], label: 'Right Knee', region: 'leg' },
  'knee-left': { position: [-0.033, 0.1, 0.0165], label: 'Left Knee', region: 'leg' },
  'knee-back-right': { position: [0.033, 0.1, -0.0165], label: 'Right Back of Knee', region: 'leg' },
  'knee-back-left': { position: [-0.033, 0.1, -0.0165], label: 'Left Back of Knee', region: 'leg' },
  
  // Lower Legs - adjusted for better proportions
  'shin-right': { position: [0.033, 0.06, 0.0165], label: 'Right Shin', region: 'leg' },
  'shin-left': { position: [-0.033, 0.06, 0.0165], label: 'Left Shin', region: 'leg' },
  'calf-right': { position: [0.033, 0.06, -0.0165], label: 'Right Calf', region: 'leg' },
  'calf-left': { position: [-0.033, 0.06, -0.0165], label: 'Left Calf', region: 'leg' },
  
  // Feet - adjusted for better proportions
  'foot-right': { position: [0.033, 0.02, 0.0165], label: 'Right Foot', region: 'foot' },
  'foot-left': { position: [-0.033, 0.02, 0.0165], label: 'Left Foot', region: 'foot' },
  'foot-bottom-right': { position: [0.033, 0.01, -0.0055], label: 'Right Sole', region: 'foot' },
  'foot-bottom-left': { position: [-0.033, 0.01, -0.0055], label: 'Left Sole', region: 'foot' }
};

// Pre-defined anatomy regions - adjusted for better proportions
export const regionBounds = {
  head: { 
    min: [-0.033, 0.435, -0.0275], 
    max: [0.033, 0.48, 0.0275] 
  },
  neck: { 
    min: [-0.022, 0.38, -0.022], 
    max: [0.022, 0.435, 0.022] 
  },
  shoulder: { 
    min: [-0.066, 0.35, -0.022], 
    max: [0.066, 0.38, 0.022] 
  },
  chest: { 
    min: [-0.044, 0.32, 0.0], 
    max: [0.044, 0.35, 0.0275] 
  },
  back: { 
    min: [-0.044, 0.25, -0.0275], 
    max: [0.044, 0.35, 0.0] 
  },
  arm: { 
    min: [-0.088, 0.12, -0.0165], 
    max: [0.088, 0.35, 0.0165] 
  },
  abdomen: { 
    min: [-0.044, 0.2, 0.0], 
    max: [0.044, 0.32, 0.0275] 
  },
  hip: { 
    min: [-0.044, 0.15, -0.0275], 
    max: [0.044, 0.2, 0.0275] 
  },
  leg: { 
    min: [-0.044, 0.02, -0.022], 
    max: [0.044, 0.15, 0.022] 
  },
  foot: { 
    min: [-0.044, 0.0, -0.022], 
    max: [0.044, 0.02, 0.022] 
  }
};

// Mapping of regions to colors for visualization
export const regionColors = {
  head: '#ff8080',
  neck: '#80ff80',
  shoulder: '#8080ff',
  chest: '#ffff80',
  back: '#ff80ff',
  arm: '#80ffff',
  abdomen: '#ff8040',
  hip: '#40ff80',
  leg: '#4080ff',
  foot: '#ff4080'
};

// Function to determine body region based on coordinates
export const determineBodyRegion = (position) => {
  const [x, y, z] = position;
  
  // Absolute x value for symmetrical checks
  const absX = Math.abs(x);
  
  // Log the coordinates for debugging
  console.log(`Determining region for point at (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`);
  
  // --------------- HEAD REGION ---------------
  // Adjusted head region coverage
  if (y > 0.85 && y <= 0.95) {
    // Top of head
    if (absX < 0.06) {
      if (z > 0) return { region: 'head', label: 'Vertex of Skull', medicalTerm: 'Vertex Cranii' };
      else return { region: 'head', label: 'Posterior Skull', medicalTerm: 'Posterior Cranii' };
    }
    // Sides of head (temporal region)
    if (absX >= 0.06 && absX < 0.08) {
      return { 
        region: 'head', 
        label: `${x > 0 ? 'Right' : 'Left'} Temporal Region`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Temporalis`
      };
    }
  }
  
  // Face region
  if (y > 0.80 && y <= 0.85) {
    if (z > 0) {
      if (absX < 0.04) return { region: 'head', label: 'Face', medicalTerm: 'Facies' };
      if (absX < 0.08) return { 
        region: 'head', 
        label: `${x > 0 ? 'Right' : 'Left'} Cheek`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Buccalis`
      };
    }
    // Back of head
    if (z <= 0) {
      if (absX < 0.06) return { region: 'head', label: 'Occipital Region', medicalTerm: 'Regio Occipitalis' };
      return { 
        region: 'head', 
        label: `${x > 0 ? 'Right' : 'Left'} Occipital Area`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Occipitalis Lateralis`
      };
    }
  }
  
  // --------------- NECK REGION ---------------
  // Adjusted neck region
  if (y > 0.75 && y <= 0.85) {
    if (absX < 0.05) {
      if (z > 0) return { region: 'neck', label: 'Anterior Neck', medicalTerm: 'Regio Cervicalis Anterior' };
      if (z <= 0) return { region: 'neck', label: 'Posterior Neck', medicalTerm: 'Regio Cervicalis Posterior' };
    }
    if (absX >= 0.05 && absX < 0.10) {
      return { 
        region: 'neck', 
        label: `${x > 0 ? 'Right' : 'Left'} Lateral Neck`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Cervicalis Lateralis`
      };
    }
  }
  
  // --------------- SHOULDER REGION ---------------
  // Adjusted shoulder region
  if (y > 0.68 && y <= 0.75) {
    if (absX >= 0.05 && absX < 0.15) {
      if (z > 0) {
        return { 
          region: 'shoulder', 
          label: `${x > 0 ? 'Right' : 'Left'} Anterior Shoulder`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Deltoidea Anterior`
        };
      }
      if (z <= 0) {
        return { 
          region: 'shoulder', 
          label: `${x > 0 ? 'Right' : 'Left'} Posterior Shoulder`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Deltoidea Posterior`
        };
      }
    }
  }
  
  // --------------- CHEST REGION ---------------
  // Adjusted chest region
  if (y > 0.60 && y <= 0.68 && z > 0) {
    if (absX < 0.05) return { region: 'chest', label: 'Sternum', medicalTerm: 'Sternum' };
    if (absX < 0.10) return { 
      region: 'chest', 
      label: `${x > 0 ? 'Right' : 'Left'} Pectoral Region`, 
      medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Pectoralis`
    };
  }
  
  // --------------- UPPER BACK ---------------
  // Adjusted upper back region
  if (y > 0.60 && y <= 0.68 && z <= 0) {
    if (absX < 0.03) {
      return { 
        region: 'back', 
        label: 'Upper Thoracic Spine', 
        medicalTerm: 'Vertebrae Thoracicae Superiores (T1-T4)'
      };
    }
    if (absX < 0.10) {
      return { 
        region: 'back', 
        label: `${x > 0 ? 'Right' : 'Left'} Upper Back`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Thoracica Superior`
      };
    }
  }
  
  // --------------- ARM REGION ---------------
  // Upper arm - adjusted
  if ((absX > 0.12 && absX < 0.20) && y > 0.55 && y <= 0.65) {
    if (z > 0) {
      return { 
        region: 'arm', 
        label: `${x > 0 ? 'Right' : 'Left'} Biceps`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Musculus Biceps Brachii`
      };
    } else {
      return { 
        region: 'arm', 
        label: `${x > 0 ? 'Right' : 'Left'} Triceps`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Musculus Triceps Brachii`
      };
    }
  }
  
  // Elbow - adjusted
  if ((absX > 0.12 && absX < 0.20) && y > 0.45 && y <= 0.55) {
    return { 
      region: 'arm', 
      label: `${x > 0 ? 'Right' : 'Left'} Elbow`, 
      medicalTerm: `${x > 0 ? 'Right' : 'Left'} Cubitus`
    };
  }
  
  // Forearm - adjusted
  if ((absX > 0.12 && absX < 0.20) && y > 0.40 && y <= 0.45) {
    if (z > 0) {
      return { 
        region: 'arm', 
        label: `${x > 0 ? 'Right' : 'Left'} Anterior Forearm`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Antebrachii Anterior`
      };
    } else {
      return { 
        region: 'arm', 
        label: `${x > 0 ? 'Right' : 'Left'} Posterior Forearm`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Antebrachii Posterior`
      };
    }
  }
  
  // Wrist/Hand - adjusted
  if ((absX > 0.12 && absX < 0.20) && y > 0.35 && y <= 0.40) {
    if (y > 0.38) {
      return { 
        region: 'arm', 
        label: `${x > 0 ? 'Right' : 'Left'} Wrist`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Carpus`
      };
    } else {
      return { 
        region: 'arm', 
        label: `${x > 0 ? 'Right' : 'Left'} Hand`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Manus`
      };
    }
  }
  
  // --------------- MID BACK ---------------
  // Adjusted mid back region
  if (y > 0.50 && y <= 0.60 && z <= 0) {
    if (absX < 0.03) {
      return { 
        region: 'back', 
        label: 'Mid Thoracic Spine', 
        medicalTerm: 'Vertebrae Thoracicae Mediae (T5-T8)'
      };
    }
    if (absX < 0.10) {
      return { 
        region: 'back', 
        label: `${x > 0 ? 'Right' : 'Left'} Mid Back`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Thoracica Media`
      };
    }
  }
  
  // --------------- ABDOMEN ---------------
  // Adjusted abdomen region
  if (y > 0.48 && y <= 0.60 && z > 0) {
    if (absX < 0.05) {
      if (y > 0.55) {
        return { region: 'abdomen', label: 'Epigastrium', medicalTerm: 'Regio Epigastrica' };
      } else {
        return { region: 'abdomen', label: 'Umbilical Region', medicalTerm: 'Regio Umbilicalis' };
      }
    }
    if (absX >= 0.05 && absX < 0.10) {
      if (y > 0.55) {
        return { 
          region: 'abdomen', 
          label: `${x > 0 ? 'Right' : 'Left'} Upper Quadrant`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Hypochondrium`
        };
      } else {
        return { 
          region: 'abdomen', 
          label: `${x > 0 ? 'Right' : 'Left'} Flank`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Lateralis`
        };
      }
    }
  }
  
  // --------------- LOWER BACK ---------------
  // Adjusted lower back region
  if (y > 0.40 && y <= 0.50 && z <= 0) {
    if (absX < 0.03) {
      return { 
        region: 'back', 
        label: 'Lower Thoracic Spine', 
        medicalTerm: 'Vertebrae Thoracicae Inferiores (T9-T12)'
      };
    }
    if (absX < 0.10) {
      return { 
        region: 'back', 
        label: `${x > 0 ? 'Right' : 'Left'} Lower Back`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Lumbalis`
      };
    }
  }
  
  // --------------- LOWER ABDOMEN ---------------
  // Adjusted lower abdomen region
  if (y > 0.40 && y <= 0.48 && z > 0) {
    if (absX < 0.05) {
      return { region: 'abdomen', label: 'Hypogastrium', medicalTerm: 'Regio Hypogastrica' };
    }
    if (absX >= 0.05 && absX < 0.10) {
      return { 
        region: 'abdomen', 
        label: `${x > 0 ? 'Right' : 'Left'} Lower Quadrant`, 
        medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Inguinalis`
      };
    }
  }
  
  // --------------- HIP / SACRUM / PELVIS ---------------
  // Adjusted hip/pelvis region
  if (y > 0.30 && y <= 0.40) {
    // Center of the pelvis/sacrum
    if (absX < 0.05) {
      if (z <= 0) {
        if (y > 0.35) {
          return { region: 'back', label: 'Lumbar Spine', medicalTerm: 'Vertebrae Lumbales (L1-L5)' };
        } else {
          return { region: 'back', label: 'Sacrum', medicalTerm: 'Os Sacrum' };
        }
      } else {
        return { region: 'hip', label: 'Pubic Region', medicalTerm: 'Regio Pubica' };
      }
    }
    // Sides of the pelvis
    if (absX >= 0.05 && absX < 0.12) {
      if (z > 0) {
        return { 
          region: 'hip', 
          label: `${x > 0 ? 'Right' : 'Left'} Anterior Hip`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Coxae Anterior`
        };
      } else {
        return { 
          region: 'hip', 
          label: `${x > 0 ? 'Right' : 'Left'} Gluteal Region`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Glutealis`
        };
      }
    }
  }
  
  // --------------- THIGH ---------------
  // Further adjusted thigh region - moved up
  if (y > 0.20 && y <= 0.30) {
    // Check x bounds to limit to leg regions
    if (absX >= 0.03 && absX <= 0.10) {
      if (z > 0) {
        return { 
          region: 'leg', 
          label: `${x > 0 ? 'Right' : 'Left'} Anterior Thigh`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Femoris Anterior`
        };
      } else {
        return { 
          region: 'leg', 
          label: `${x > 0 ? 'Right' : 'Left'} Posterior Thigh`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Femoris Posterior` 
        };
      }
    }
  }
  
  // --------------- KNEE ---------------
  // Further adjusted knee region - moved up
  if (y > 0.15 && y <= 0.20) {
    // Check x bounds to limit to leg regions
    if (absX >= 0.03 && absX <= 0.10) {
      if (z > 0) {
        return { 
          region: 'leg', 
          label: `${x > 0 ? 'Right' : 'Left'} Knee`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Genu Anterior`
        };
      } else {
        return { 
          region: 'leg', 
          label: `${x > 0 ? 'Right' : 'Left'} Popliteal Fossa`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Fossa Poplitea`
        };
      }
    }
  }
  
  // --------------- LOWER LEG ---------------
  // Further adjusted lower leg region - moved up
  if (y > 0.10 && y <= 0.15) {
    // Check x bounds to limit to leg regions
    if (absX >= 0.03 && absX <= 0.10) {
      if (z > 0) {
        return { 
          region: 'leg', 
          label: `${x > 0 ? 'Right' : 'Left'} Shin`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Tibialis Anterior`
        };
      } else {
        return { 
          region: 'leg', 
          label: `${x > 0 ? 'Right' : 'Left'} Calf`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Suralis`
        };
      }
    }
  }
  
  // --------------- FOOT ---------------
  // Further adjusted foot region - moved up
  if (y <= 0.10 && y >= 0.00) {
    // Check x bounds to limit to foot regions
    if (absX >= 0.03 && absX <= 0.10) {
      if (z > 0) {
        return { 
          region: 'foot', 
          label: `${x > 0 ? 'Right' : 'Left'} Dorsal Foot`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Dorsum Pedis`
        };
      } else {
        return { 
          region: 'foot', 
          label: `${x > 0 ? 'Right' : 'Left'} Plantar Foot`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Planta Pedis`
        };
      }
    }
  }
  
  // Extended check for limbs at wider angles from body
  // This helps cover portions of the model that stick out further
  
  // Extended arm check - adjusted
  if (absX >= 0.20 && absX < 0.30) {
    if (y > 0.30 && y <= 0.65) {
      if (y > 0.55) {
        return { 
          region: 'arm', 
          label: `${x > 0 ? 'Right' : 'Left'} Upper Arm`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Brachium`
        };
      } else if (y > 0.45) {
        return { 
          region: 'arm', 
          label: `${x > 0 ? 'Right' : 'Left'} Forearm`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Antebrachium`
        };
      } else {
        return { 
          region: 'arm', 
          label: `${x > 0 ? 'Right' : 'Left'} Wrist/Hand`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Carpus/Manus`
        };
      }
    }
  }
  
  // Extended leg check for wider stances - moved up
  if (absX >= 0.10 && absX < 0.15) {
    if (y <= 0.30 && y > 0.10) {
      if (y > 0.20) {
        return { 
          region: 'leg', 
          label: `${x > 0 ? 'Right' : 'Left'} Lateral Thigh`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Femoris Lateralis`
        };
      } else if (y > 0.15) {
        return { 
          region: 'leg', 
          label: `${x > 0 ? 'Right' : 'Left'} Lateral Knee`, 
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Genu Lateralis`
        };
      } else {
        return {
          region: 'leg',
          label: `${x > 0 ? 'Right' : 'Left'} Lateral Lower Leg`,
          medicalTerm: `${x > 0 ? 'Right' : 'Left'} Regio Cruris Lateralis`
        };
      }
    }
  }
  
  // Default fallback if no specific region is matched
  console.warn(`No specific region matched for coordinates (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`);
  
  // Attempt to broadly categorize based on y-position if specific region wasn't found
  if (y > 0.85) {
    return { region: 'head', label: 'Head Region', medicalTerm: 'Caput' };
  } else if (y > 0.75) {
    return { region: 'neck', label: 'Neck Region', medicalTerm: 'Cervix' };
  } else if (y > 0.45) {
    if (z > 0) {
      return { region: 'chest', label: 'Torso Front', medicalTerm: 'Truncus Anterior' };
    } else {
      return { region: 'back', label: 'Torso Back', medicalTerm: 'Truncus Posterior' };
    }
  } else if (y > 0.30) {
    return { region: 'abdomen', label: 'Abdominal/Hip Region', medicalTerm: 'Regio Abdominalis/Coxae' };
  } else if (y > 0.15) {
    return { region: 'leg', label: 'Upper Leg Region', medicalTerm: 'Membrum Inferius Superius' };
  } else if (y > 0.10) {
    return { region: 'leg', label: 'Lower Leg Region', medicalTerm: 'Membrum Inferius Inferius' };
  } else {
    return { region: 'foot', label: 'Foot Region', medicalTerm: 'Pes' };
  }
}; 