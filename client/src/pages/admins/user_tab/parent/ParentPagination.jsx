import React from 'react';
import {
    FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight
} from "react-icons/fa";

const ParentPagination = ({
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    onPageChange,
    onFirstPage,
    onLastPage,
    onPreviousPage,
    onNextPage
}) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                padding: '10px 15px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
            }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Показано {startIndex + 1}-{Math.min(endIndex, totalItems)} з {totalItems} батьків
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Сторінка {currentPage} з {totalPages}
                </div>
            </div>

            {/* Навігація - показуємо тільки якщо більше однієї сторінки */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <button
                        onClick={onFirstPage}
                        disabled={currentPage === 1}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                            color: currentPage === 1 ? '#9ca3af' : '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (currentPage !== 1) {
                                e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                                e.target.style.borderColor = 'rgba(105, 180, 185, 0.3)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (currentPage !== 1) {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.borderColor = '#d1d5db';
                            }
                        }}
                    >
                        <FaAngleDoubleLeft size={12} />
                    </button>

                    <button
                        onClick={onPreviousPage}
                        disabled={currentPage === 1}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                            color: currentPage === 1 ? '#9ca3af' : '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (currentPage !== 1) {
                                e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                                e.target.style.borderColor = 'rgba(105, 180, 185, 0.3)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (currentPage !== 1) {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.borderColor = '#d1d5db';
                            }
                        }}
                    >
                        <FaChevronLeft size={12} />
                        Попередня
                    </button>

                    {getPageNumbers().map(page => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: currentPage === page ? 'rgba(105, 180, 185, 1)' : 'white',
                                color: currentPage === page ? 'white' : '#374151',
                                border: `1px solid ${currentPage === page ? 'rgba(105, 180, 185, 1)' : '#d1d5db'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: currentPage === page ? '600' : '400',
                                transition: 'all 0.2s',
                                minWidth: '40px'
                            }}
                            onMouseOver={(e) => {
                                if (currentPage !== page) {
                                    e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                                    e.target.style.borderColor = 'rgba(105, 180, 185, 0.3)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (currentPage !== page) {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.borderColor = '#d1d5db';
                                }
                            }}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={onNextPage}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                            color: currentPage === totalPages ? '#9ca3af' : '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (currentPage !== totalPages) {
                                e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                                e.target.style.borderColor = 'rgba(105, 180, 185, 0.3)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (currentPage !== totalPages) {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.borderColor = '#d1d5db';
                            }
                        }}
                    >
                        Наступна
                        <FaChevronRight size={12} />
                    </button>

                    <button
                        onClick={onLastPage}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                            color: currentPage === totalPages ? '#9ca3af' : '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (currentPage !== totalPages) {
                                e.target.style.backgroundColor = 'rgba(105, 180, 185, 0.1)';
                                e.target.style.borderColor = 'rgba(105, 180, 185, 0.3)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (currentPage !== totalPages) {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.borderColor = '#d1d5db';
                            }
                        }}
                    >
                        <FaAngleDoubleRight size={12} />
                    </button>
                </div>
            )}
        </>
    );
};

export default ParentPagination;