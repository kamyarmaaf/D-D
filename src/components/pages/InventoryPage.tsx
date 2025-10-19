import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Inventory } from '../Inventory';
import { useEnhancedGameStore } from '../../store/enhancedGameStore';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { inventory, removeInventoryItem } = useEnhancedGameStore();

  const handleItemUse = (item: any) => {
    // Handle item usage logic here
    console.log('Using item:', item.name);
  };

  const handleItemDrop = (itemId: string) => {
    removeInventoryItem(itemId);
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div>
      <button
        onClick={handleBack}
        className="mb-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
      >
        ← Back
      </button>
      <Inventory
        items={inventory}
        onItemUse={handleItemUse}
        onItemDrop={handleItemDrop}
      />
    </div>
  );
};
