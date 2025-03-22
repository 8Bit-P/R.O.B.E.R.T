// Function to get stored positions (e.g., pos_0, pos_1, etc.)
export const getStoredPositionsIDs = (): string[] => {
  const storedPositions = Object.keys(localStorage).filter((key) => key.startsWith('pos_'));
  //TODO: remove
  // Log stored positions and their corresponding angles to the console
  storedPositions.forEach((position) => {
    const storedAngle = localStorage.getItem(position);
    console.log(`Position: ${position}, Angle: ${storedAngle}`);
  });
  return storedPositions;
};

// Store the current angle at a new position (e.g., pos_0, pos_1, etc.)
export const storePosition = (angles: Record<number, number | null>): Promise<boolean> => {
  const positionId = `pos_${Object.keys(localStorage).filter((key) => key.startsWith('pos_')).length}`;

  // Store the current angle in localStorage with the position ID
  if (angles) {
    localStorage.setItem(positionId, JSON.stringify(angles));
    return Promise.resolve(true);
  }

  return Promise.resolve(false);
};

// Delete a position from localStorage by ID
export const deletePosition = (positionId: string | null): Promise<boolean> => {
  if (positionId === null) return Promise.resolve(false);

  if (localStorage.getItem(positionId)) {
    localStorage.removeItem(positionId); // Remove the position from localStorage
    return Promise.resolve(true);
  }
  return Promise.resolve(false); // Return false if the position doesn't exist
};
