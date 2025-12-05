import React, { useState, useEffect } from 'react';
import axios from "axios";
import AdminHeader from './AdminHeader';
import AdminList from './AdminList';
import AdminPagination from './AdminPagination';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EditAdminPopup from './EditAdminPopup';
import DeleteAdminPopup from './DeleteAdminPopup';

const AdminShowAdmin = () => {
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(() => {
        const width = window.innerWidth;
        if (width < 768) return 5;
        if (width < 1024) return 10;
        return 15;
    });
    const [databaseName, setDatabaseName] = useState("");
    const [currentAdminId, setCurrentAdminId] = useState("");
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const [editingAdmin, setEditingAdmin] = useState(null);
    const [deletingAdmin, setDeletingAdmin] = useState(null);

    const API_URL = "http://localhost:3001/api/users";

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const getCurrentAdminInfo = () => {
            let dbName = localStorage.getItem('databaseName');
            let currentUserId = "";

            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (!dbName && user.databaseName) {
                        dbName = user.databaseName;
                    }
                    if (user.id) {
                        currentUserId = user.id;
                    } else if (user._id) {
                        currentUserId = user._id;
                    }
                } catch (e) {
                    console.error("Помилка парсингу user:", e);
                }
            }

            const userInfoStr = localStorage.getItem('userInfo');
            if (userInfoStr) {
                try {
                    const userInfo = JSON.parse(userInfoStr);
                    if (!dbName && userInfo.databaseName) {
                        dbName = userInfo.databaseName;
                    }
                    if (!currentUserId && userInfo.userId) {
                        currentUserId = userInfo.userId;
                    }
                } catch (e) {
                    console.error("Помилка парсингу userInfo:", e);
                }
            }

            return { dbName, currentUserId };
        };

        const { dbName, currentUserId } = getCurrentAdminInfo();

        if (dbName) {
            setDatabaseName(dbName);
            setCurrentAdminId(currentUserId || "");
        } else {
            console.error("Database name не знайдено!");
            setError("Не вдалося визначити базу даних школи");
            setLoading(false);
        }
    }, []);

    const fetchAdmins = async () => {
        if (!databaseName) {
            console.error("Database name відсутній для запиту адміністраторів");
            setError("Не вказано базу даних");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axios.get(`${API_URL}/by-role/admin`, {
                params: { databaseName }
            });

            const adminsWithoutCurrent = currentAdminId
                ? response.data.filter(admin => admin._id !== currentAdminId)
                : response.data;

            setAdmins(adminsWithoutCurrent);
            setFilteredAdmins(adminsWithoutCurrent);

        } catch (err) {
            console.error("Помилка завантаження адміністраторів:", err);
            if (err.response) {
                console.error("Статус помилки:", err.response.status);
                console.error("Дані помилки:", err.response.data);
            }
            setError(err.response?.data?.error || "Помилка завантаження адміністраторів");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (databaseName) {
            fetchAdmins();
        } else {
            setLoading(false);
        }
    }, [databaseName, currentAdminId]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredAdmins(admins);
        } else {
            const searchLower = searchQuery.toLowerCase();
            const filtered = admins.filter(admin =>
                admin.fullName?.toLowerCase().includes(searchLower) ||
                admin.email?.toLowerCase().includes(searchLower) ||
                admin.phone?.toLowerCase().includes(searchLower) ||
                admin.jobPosition?.toLowerCase().includes(searchLower)
            );
            setFilteredAdmins(filtered);
        }
        setCurrentPage(1);
    }, [searchQuery, admins]);

    const sortAdmins = (adminsArray, order) => {
        return [...adminsArray].sort((a, b) => {
            const nameA = a.fullName?.toLowerCase() || '';
            const nameB = b.fullName?.toLowerCase() || '';
            return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
    };

    const handleSortToggle = () => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    };

    const sortedAdmins = sortAdmins(filteredAdmins, sortOrder);

    const totalItems = sortedAdmins.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAdmins = sortedAdmins.slice(startIndex, endIndex);

    const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
    };

    const handleDelete = (admin) => {
        setDeletingAdmin(admin);
    };

    const handleUpdateAdmin = (updatedAdmin) => {
        setAdmins(prev => prev.map(admin =>
            admin._id === updatedAdmin._id ? updatedAdmin : admin
        ));
        setEditingAdmin(null);
    };

    const handleDeleteAdmin = (adminId) => {
        setAdmins(prev => prev.filter(admin => admin._id !== adminId));
        setDeletingAdmin(null);
    };

    const closeEditPopup = () => {
        setEditingAdmin(null);
    };

    const closeDeletePopup = () => {
        setDeletingAdmin(null);
    };

    const isMobile = windowWidth < 768;

    if (loading) {
        return <LoadingState message="Завантаження адміністраторів..." isMobile={isMobile} />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={fetchAdmins} isMobile={isMobile} />;
    }

    return (
        <div style={{
            padding: isMobile ? '10px' : '20px',
            maxWidth: '100%',
            overflowX: 'hidden',
            boxSizing: 'border-box'
        }}>
            <AdminHeader
                adminCount={filteredAdmins.length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortOrder={sortOrder}
                onSortToggle={handleSortToggle}
                isMobile={isMobile}
            />

            {filteredAdmins.length === 0 && !loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: isMobile ? '20px 15px' : '40px 20px',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px dashed #e5e7eb',
                    marginTop: isMobile ? '10px' : '20px'
                }}>
                    <h4 style={{
                        marginBottom: '10px',
                        color: '#374151',
                        fontSize: isMobile ? '16px' : '18px'
                    }}>
                        Інших адміністраторів не знайдено
                    </h4>
                    <p style={{
                        margin: 0,
                        fontSize: isMobile ? '14px' : '16px'
                    }}>
                        {searchQuery
                            ? `За запитом "${searchQuery}" інших адміністраторів не знайдено`
                            : 'У системі немає інших адміністраторів'
                        }
                    </p>
                </div>
            ) : (
                <>
                    <AdminList
                        admins={currentAdmins}
                        searchQuery={searchQuery}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isMobile={isMobile}
                    />

                    {totalPages > 1 && (
                        <AdminPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            onFirstPage={goToFirstPage}
                            onPreviousPage={goToPreviousPage}
                            onNextPage={goToNextPage}
                            onLastPage={goToLastPage}
                            onPageChange={goToPage}
                            isMobile={isMobile}
                        />
                    )}
                </>
            )}

            {editingAdmin && (
                <EditAdminPopup
                    admin={editingAdmin}
                    databaseName={databaseName}
                    onClose={closeEditPopup}
                    onUpdate={handleUpdateAdmin}
                    isMobile={isMobile}
                />
            )}

            {deletingAdmin && (
                <DeleteAdminPopup
                    admin={deletingAdmin}
                    databaseName={databaseName}
                    onClose={closeDeletePopup}
                    onDelete={handleDeleteAdmin}
                    isMobile={isMobile}
                />
            )}
        </div>
    );
};

export default AdminShowAdmin;