import { useState } from "react";
import box from "../Components/Box/box";

export function useCanvas() {
  const [boxes, setBoxes] = useState([]);
  const [lines, setLines] = useState([]);
  const gridSize = 20;

  const snapToGrid = (value) => Math.round(value / gridSize) * gridSize;

  const isPositionValid = (x, y, width, height) => {
    return !boxes.some(
      (box) =>
        x < box.x + box.width &&
        x + width > box.x &&
        y < box.y + box.height &&
        y + height > box.y
    );
  };

  const findNearestValidPosition = (x, y, width, height) => {
    const offsets = [
      { dx: 0, dy: 0 },
      { dx: gridSize, dy: 0 },
      { dx: -gridSize, dy: 0 },
      { dx: 0, dy: gridSize },
      { dx: 0, dy: -gridSize },
      { dx: gridSize, dy: gridSize },
      { dx: -gridSize, dy: gridSize },
      { dx: gridSize, dy: -gridSize },
      { dx: -gridSize, dy: -gridSize },
    ];

    for (let i = 0; i < 50; i++) {
      for (const offset of offsets) {
        const newX = x + offset.dx * i;
        const newY = y + offset.dy * i;
        if (isPositionValid(newX, newY, width, height)) {
          return { x: newX, y: newY };
        }
      }
    }
    return { x, y };
  };

  const addBox = (x, y, width = 150, height = 50, color = '#f00') => {
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);

    let finalPosition = { x: snappedX, y: snappedY };
    if (!isPositionValid(snappedX, snappedY, width, height)) {
      finalPosition = findNearestValidPosition(snappedX, snappedY, width, height);
      console.log(`Box moved to nearest valid position at (${finalPosition.x}, ${finalPosition.y}).`);
    }

    let boxNameIndex = boxes.length + 1;

    while (!isBoxNameUnique(`Box ${boxNameIndex}`)) {
      boxNameIndex++;
    }
    
    const boxName = `Box ${boxNameIndex}`;
    
    const newBox = {
      id: boxes.length + 1,
      name: boxName,
      x: finalPosition.x,
      y: finalPosition.y,
      width,
      height,
      color,
      inputs: 1,
      outputs: 1,
      hookCount: 2, // Define hookCount here with a default value
      selected: false,
    };
    setBoxes([...boxes, newBox]);
    console.log(`Added Box ID: ${newBox.id}, Position: (${newBox.x}, ${newBox.y})`);
  };

  const updateBoxPosition = (id, x, y, canvasWidth, canvasHeight) => {
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);

    setBoxes((prevBoxes) =>
      prevBoxes.map((box) =>
        box.id === id
          ? {
              ...box,
              x: Math.max(0, Math.min(snappedX, canvasWidth - box.width)),
              y: Math.max(0, Math.min(snappedY, canvasHeight - box.height)),
            }
          : box
      )
    );
  };

  const updateBox = (id, updatedProperties) => {
    setBoxes((prevBoxes) =>
      prevBoxes.map((box) =>
        box.id === id ? { ...box, ...updatedProperties } : box
      )
    );
  };

  const deleteBox = (id) => {
    console.log(`Deleting Box with ID: ${id}`);
    setBoxes((prevBoxes) => prevBoxes.filter((box) => box.id !== id));
  };

  const addLine = ({ startBoxId, endBoxId, startHook, endHook }) => {
    if (!startBoxId || !endBoxId || !startHook || !endHook) {
      console.error("Invalid parameters for adding a line", { startBoxId, endBoxId, startHook, endHook });
      return;
    }

    const newLine = {
      id: lines.length + 1,
      startBoxId,
      endBoxId,
      startHook,
      endHook,
    };

    setLines([...lines, newLine]);
    console.log(`Added Line ID: ${newLine.id} between boxes ${startBoxId} and ${endBoxId}`);
  };

  const selectBox = (id) => {
    setBoxes((prevBoxes) =>
      prevBoxes.map((box) => ({ ...box, selected: box.id === id }))
    );
  };

  const isBoxNameUnique = (newBoxName) => {
    return !boxes.some((box) => box.name === newBoxName);
  };

  const updateBoxHookCount = (boxId, newHookCount) => {
    setBoxes(prevBoxes => prevBoxes.map(box => 
      box.id === boxId ? { ...box, hookCount: newHookCount } : box
    ));
  };

  return {
    boxes,
    lines,
    isBoxNameUnique,
    addBox,
    updateBoxPosition,
    updateBox,
    deleteBox,
    addLine,
    selectBox,
    updateBoxHookCount,
  };
}
