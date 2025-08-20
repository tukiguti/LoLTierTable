import React from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  DragOverlay,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  CollisionDetection,
} from '@dnd-kit/core';

interface DragDropContextProps {
  children: React.ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  dragOverlay?: React.ReactNode;
}

export const DragDropContext: React.FC<DragDropContextProps> = ({
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
  dragOverlay,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Minimal distance for instant response
      },
    })
  );

  // Store mouse coordinates globally during drag
  const mouseCoordinatesRef = React.useRef<{ x: number; y: number } | null>(null);

  // Optimized collision detection for freeboard positioning
  const freeboardCollisionDetection: CollisionDetection = React.useCallback((args) => {
    const { droppableContainers, pointerCoordinates } = args;
    
    // Store current mouse coordinates for better performance
    if (pointerCoordinates) {
      mouseCoordinatesRef.current = pointerCoordinates;
    }
    
    // Use standard collision detection
    const standardCollisions = rectIntersection(args);
    
    // For freeboard containers, add coordinate information
    if (standardCollisions && standardCollisions.length > 0 && pointerCoordinates) {
      const freeboardCollisions = standardCollisions.filter(collision => 
        collision.id === 'freeboard-grid' || String(collision.id).startsWith('zone-')
      );
      
      for (const collision of freeboardCollisions) {
        const containersArray = Array.from(droppableContainers.values());
        const container = containersArray.find(c => c.id === collision.id);
        
        if (container && container.node.current) {
          const elementRect = container.node.current.getBoundingClientRect();
          const relativeX = pointerCoordinates.x - elementRect.left;
          const relativeY = pointerCoordinates.y - elementRect.top;
          
          // Store coordinates for later use
          (collision as typeof collision & { coordinates: { x: number; y: number } }).coordinates = { 
            x: relativeX, 
            y: relativeY 
          };
        }
      }
    }
    
    return standardCollisions;
  }, []);

  const handleDragEndWithCoordinates = React.useCallback((event: DragEndEvent) => {
    // Add coordinate information for freeboard drops
    if (event.over && (event.over.id === 'freeboard-grid' || String(event.over.id).startsWith('zone-'))) {
      let coordinates: { x: number; y: number } | null = null;
      
      // Method 1: Try to get coordinates from collision detection (most accurate)
      if (event.collisions) {
        const collision = event.collisions.find(c => 
          c.id === event.over?.id && 'coordinates' in c
        );
        if (collision && 'coordinates' in collision) {
          coordinates = (collision as typeof collision & { coordinates: { x: number; y: number } }).coordinates;
        }
      }
      
      // Method 2: Fallback to stored mouse coordinates
      if (!coordinates && mouseCoordinatesRef.current) {
        const freeboardElement = document.getElementById(String(event.over.id));
        if (freeboardElement) {
          const elementRect = freeboardElement.getBoundingClientRect();
          coordinates = {
            x: mouseCoordinatesRef.current.x - elementRect.left,
            y: mouseCoordinatesRef.current.y - elementRect.top
          };
        }
      }
      
      if (coordinates) {
        (event as DragEndEvent & { delta: { x: number; y: number } }).delta = coordinates;
      }
    }
    
    onDragEnd(event);
  }, [onDragEnd]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={freeboardCollisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={handleDragEndWithCoordinates}
    >
      {children}
      <DragOverlay
        style={{
          cursor: 'grabbing',
          transform: 'rotate(5deg)', // Slight rotation for better visual feedback
          zIndex: 1000,
        }}
      >
        {dragOverlay}
      </DragOverlay>
    </DndContext>
  );
};