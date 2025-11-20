import React from 'react';

const AdminPagination = ({
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    onFirstPage,
    onPreviousPage,
    onNextPage,
    onLastPage
}) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 0',
            borderTop: '1px solid #e5e7eb',
            flexWrap: 'wrap',
            gap: '10px'
        }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
                Показано {startIndex + 1}-{Math.min(endIndex, totalItems)} з {totalItems}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <PaginationButton
                    onClick={onFirstPage}
                    disabled={currentPage === 1}
                    label="Перша"
                />
                <PaginationButton
                    onClick={onPreviousPage}
                    disabled={currentPage === 1}
                    label="Попередня"
                />
                <span style={{ padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
                    Сторінка {currentPage} з {totalPages}
                </span>
                <PaginationButton
                    onClick={onNextPage}
                    disabled={currentPage === totalPages}
                    label="Наступна"
                />
                <PaginationButton
                    onClick={onLastPage}
                    disabled={currentPage === totalPages}
                    label="Остання"
                />
            </div>
        </div>
    );
};

const PaginationButton = ({ onClick, disabled, label }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            borderRadius: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1
        }}
    >
        {label}
    </button>
);

export default AdminPagination;