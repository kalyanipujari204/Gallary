import React from 'react';
import { SORT_OPTIONS } from '../constants';
import { SortOption } from '../types';

interface FilterControlsProps {
    onSort: (sortOption: SortOption) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onSort }) => {
    return (
        <select 
            className="px-3 py-1.5 bg-gray-200/50 dark:bg-gray-900/50 rounded-md border border-transparent focus:ring-2 focus:ring-neon-cyan focus:border-transparent outline-none text-sm"
            onChange={(e) => onSort(e.target.value as SortOption)}
            aria-label="Sort media by"
        >
            {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    );
}

export default FilterControls;
