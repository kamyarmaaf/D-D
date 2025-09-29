import React, { useState } from 'react';
import { Package, Sword, Shield, FlaskConical, Wrench, Star, Plus, Trash2, Eye } from 'lucide-react';
import { InventoryItem, ItemEffect } from '../types/game';
import { useLanguage } from '../hooks/useLanguage';

interface InventoryProps {
  items: InventoryItem[];
  onItemUse: (item: InventoryItem) => void;
  onItemDrop: (itemId: string) => void;
  onItemAdd: (item: InventoryItem) => void;
}

const typeIcons = {
  weapon: Sword,
  armor: Shield,
  consumable: FlaskConical,
  tool: Wrench,
  misc: Package
};

const rarityColors = {
  common: 'text-gray-400',
  uncommon: 'text-ink-muted',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400'
};

const rarityBorders = {
  common: 'border-gray-500/30',
  uncommon: 'border-amber-500/30',
  rare: 'border-blue-500/30',
  epic: 'border-purple-500/30',
  legendary: 'border-yellow-500/30'
};

export const Inventory: React.FC<InventoryProps> = ({ items, onItemUse, onItemDrop, onItemAdd }) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<string>('name');

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rarity':
        const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      case 'value':
        return b.value - a.value;
      case 'weight':
        return b.weight - a.weight;
      default:
        return 0;
    }
  });

  const getTotalWeight = () => {
    return items.reduce((total, item) => total + (item.weight * item.quantity), 0);
  };

  const getTotalValue = () => {
    return items.reduce((total, item) => total + (item.value * item.quantity), 0);
  };

  const renderItemEffects = (effects: ItemEffect[]) => {
    return effects.map((effect, index) => (
      <div key={index} className="text-xs text-ink-muted">
        {effect.type.replace('_', ' ')}: {effect.target} {effect.value > 0 ? '+' : ''}{effect.value}
      </div>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto glass-card p-4 sm:p-6 lg:p-8 shadow-2xl">
      <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500/40 to-purple-500/40 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" />
            </div>
            <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-ink">{t('inventory.title')}</h2>
            <p className="text-sm sm:text-base text-ink-muted">{t('inventory.manageItems')}</p>
            </div>
          </div>
          <button
            onClick={() => {/* Add new item modal */}}
            className="px-3 sm:px-4 py-2 sm:py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="glass-card p-3 sm:p-4 border-cyan-500/20">
            <div className="text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-600">{items.length}</div>
              <div className="text-xs sm:text-sm text-ink-muted">Total Items</div>
            </div>
          </div>
          <div className="glass-card p-3 sm:p-4 border-yellow-500/20">
            <div className="text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{getTotalWeight().toFixed(1)}</div>
              <div className="text-xs sm:text-sm text-ink-muted">Total Weight (lbs)</div>
            </div>
          </div>
          <div className="glass-card p-3 sm:p-4 border-amber-500/20 sm:col-span-2 lg:col-span-1">
            <div className="text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-ink-muted">{getTotalValue()}</div>
              <div className="text-xs sm:text-sm text-ink-muted">Total Value (gp)</div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 sm:px-3 py-1 sm:py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                filter === 'all' 
                  ? 'bg-purple-600 text-ink' 
                  : 'bg-amber-100/50 text-ink hover:bg-amber-200/50'
              }`}
            >
              All
            </button>
            {Object.keys(typeIcons).map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-2 sm:px-3 py-1 sm:py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 capitalize ${
                  filter === type 
                    ? 'bg-purple-600 text-ink' 
                    : 'bg-amber-100/50 text-ink hover:bg-amber-200/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-ink-muted">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 sm:px-3 py-1 sm:py-1 bg-amber-50/80 border border-purple-500/30 rounded-lg text-ink text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="name">Name</option>
              <option value="rarity">Rarity</option>
              <option value="value">Value</option>
              <option value="weight">Weight</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {sortedItems.map((item) => {
          const Icon = typeIcons[item.type];
          return (
            <div
              key={item.id}
              className={`group glass-card p-3 sm:p-4 lg:p-6 hover:scale-105 transition-all duration-300 cursor-pointer border ${rarityBorders[item.rarity]}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center ${
                    item.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30' :
                    item.rarity === 'epic' ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30' :
                    item.rarity === 'rare' ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30' :
                    item.rarity === 'uncommon' ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/30' :
                    'bg-gradient-to-br from-gray-500/30 to-slate-500/30'
                  }`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${rarityColors[item.rarity]}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-ink group-hover:gradient-text transition-all duration-300 truncate">
                      {item.name}
                    </h3>
                    <p className={`text-xs sm:text-sm font-semibold capitalize ${rarityColors[item.rarity]}`}>
                      {item.rarity}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemUse(item);
                    }}
                    className="p-1.5 sm:p-2 bg-amber-600/20 hover:bg-amber-600/40 text-ink-muted rounded-lg transition-all duration-300"
                    title="Use Item"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemDrop(item.id);
                    }}
                    className="p-1.5 sm:p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-all duration-300"
                    title="Drop Item"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>

              <p className="text-ink text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{item.description}</p>

              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-ink-muted">Quantity:</span>
                  <span className="text-ink font-semibold">{item.quantity}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-ink-muted">Value:</span>
                  <span className="text-ink-muted font-semibold">{item.value} gp</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-ink-muted">Weight:</span>
                  <span className="text-yellow-600 font-semibold">{item.weight} lbs</span>
                </div>
                {item.effects && item.effects.length > 0 && (
                  <div className="pt-1 sm:pt-2 border-t border-white/10">
                    <div className="text-xs text-ink-muted mb-1">Effects:</div>
                    {renderItemEffects(item.effects)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sortedItems.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-ink-muted mb-2">No Items Found</h3>
          <p className="text-sm sm:text-base text-ink-muted">Your inventory is empty or no items match your current filter.</p>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="glass-card p-4 sm:p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center ${
                  selectedItem.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30' :
                  selectedItem.rarity === 'epic' ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30' :
                  selectedItem.rarity === 'rare' ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30' :
                  selectedItem.rarity === 'uncommon' ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/30' :
                  'bg-gradient-to-br from-gray-500/30 to-slate-500/30'
                }`}>
                  {React.createElement(typeIcons[selectedItem.type], { 
                    className: `h-6 w-6 sm:h-8 sm:w-8 ${rarityColors[selectedItem.rarity]}` 
                  })}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-ink truncate">{selectedItem.name}</h2>
                  <p className={`text-sm sm:text-base lg:text-lg font-semibold capitalize ${rarityColors[selectedItem.rarity]}`}>
                    {selectedItem.rarity} {selectedItem.type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 sm:p-2 bg-gray-600/20 hover:bg-gray-600/40 text-gray-400 rounded-lg transition-all duration-300 flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-ink mb-2">Description</h3>
                <p className="text-sm sm:text-base text-ink">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="glass-card p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-600">{selectedItem.quantity}</div>
                  <div className="text-xs sm:text-sm text-ink-muted">Quantity</div>
                </div>
                <div className="glass-card p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-ink-muted">{selectedItem.value}</div>
                  <div className="text-xs sm:text-sm text-ink-muted">Value (gp)</div>
                </div>
                <div className="glass-card p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{selectedItem.weight}</div>
                  <div className="text-xs sm:text-sm text-ink-muted">Weight (lbs)</div>
                </div>
                <div className="glass-card p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{selectedItem.value * selectedItem.quantity}</div>
                  <div className="text-xs sm:text-sm text-ink-muted">Total Value</div>
                </div>
              </div>

              {selectedItem.effects && selectedItem.effects.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-ink mb-3">Effects</h3>
                  <div className="space-y-2">
                    {selectedItem.effects.map((effect, index) => (
                      <div key={index} className="glass-card p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <div className="font-semibold text-ink capitalize text-sm sm:text-base">
                              {effect.type.replace('_', ' ')}
                            </div>
                            <div className="text-xs sm:text-sm text-ink-muted">
                              Target: {effect.target} | Value: {effect.value > 0 ? '+' : ''}{effect.value}
                            </div>
                          </div>
                          {effect.duration && (
                            <div className="text-xs sm:text-sm text-blue-600">
                              Duration: {effect.duration}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    onItemUse(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                  Use Item
                </button>
                <button
                  onClick={() => {
                    onItemDrop(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                  Drop Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
