import React from 'react';
import {
    FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight
} from "react-icons/fa";

const AdminPagination = ({
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    onFirstPage,
    onPreviousPage,
    onNextPage,
    onLastPage,
    onPageChange,
    isMobile
}) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = isMobile ? 3 : 5;

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
                marginBottom: isMobile ? '10px' : '15px',
                padding: isMobile ? '10px' : '10px 15px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '6px' : '0'
            }}>
                <div style={{
                    fontSize: isMobile ? '13px' : '14px',
                    color: '#6b7280'
                }}>
                    Показано {startIndex + 1}-{Math.min(endIndex, totalItems)} з {totalItems}
                </div>
                <div style={{
                    fontSize: isMobile ? '13px' : '14px',
                    color: '#6b7280'
                }}>
                    Сторінка {currentPage} з {totalPages}
                </div>
            </div>

            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: isMobile ? '4px' : '8px',
                    padding: isMobile ? '12px' : '15px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={onFirstPage}
                        disabled={currentPage === 1}
                        style={{
                            padding: isMobile ? '6px 8px' : '8px 12px',
                            backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                            color: currentPage === 1 ? '#9ca3af' : '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: isMobile ? '12px' : '14px',
                            minWidth: isMobile ? '36px' : '40px'
                        }}
                    >
                        <FaAngleDoubleLeft size={isMobile ? 10 : 12} />
                    </button>

                    <button
                        onClick={onPreviousPage}
                        disabled={currentPage === 1}
                        style={{
                            padding: isMobile ? '6px 10px' : '8px 12px',
                            backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                            color: currentPage === 1 ? '#9ca3af' : '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: isMobile ? '12px' : '14px'
                        }}
                    >
                        <FaChevronLeft size={isMobile ? 10 : 12} />
                        {!isMobile && 'Попередня'}
                    </button>

                    {getPageNumbers().map(page => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            style={{
                                padding: isMobile ? '6px 8px' : '8px 12px',
                                backgroundColor: currentPage === page ? 'rgba(105, 180, 185, 1)' : 'white',
                                color: currentPage === page ? 'white' : '#374151',
                                border: `1px solid ${currentPage === page ? 'rgba(105, 180, 185, 1)' : '#d1d5db'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: isMobile ? '12px' : '14px',
                                fontWeight: currentPage === page ? '600' : '400',
                                minWidth: isMobile ? '36px' : '40px'
                            }}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={onNextPage}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: isMobile ? '6px 10px' : '8px 12px',
                            backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                            color: currentPage === totalPages ? '#9ca3af' : '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: isMobile ? '12px' : '14px'
                        }}
                    >
                        {!isMobile && 'Наступна'}
                        <FaChevronRight size={isMobile ? 10 : 12} />
                    </button>

                    <button
                        onClick={onLastPage}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: isMobile ? '6px 8px' : '8px 12px',
                            backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                            color: currentPage === totalPages ? '#9ca3af' : '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: isMobile ? '12px' : '14px',
                            minWidth: isMobile ? '36px' : '40px'
                        }}
                    >
                        <FaAngleDoubleRight size={isMobile ? 10 : 12} />
                    </button>
                </div>
            )}
        </>
    );
};

export default AdminPagination;