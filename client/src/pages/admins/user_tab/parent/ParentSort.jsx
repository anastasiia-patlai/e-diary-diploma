import React from 'react';
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";

const ParentSort = ({ sortOrder, onSortToggle }) => {
    return (
        <button
            onClick={onSortToggle}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                backgroundColor: 'rgba(105, 180, 185, 0.1)',
                color: 'rgba(105, 180, 185, 1)',
                border: '1px solid rgba(105, 180, 185, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.2)';
            }}
            onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
            }}
        >
            {sortOrder === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
            {sortOrder === 'asc' ? 'А-Я' : 'Я-А'}
        </button>
    );
};

export default ParentSort;