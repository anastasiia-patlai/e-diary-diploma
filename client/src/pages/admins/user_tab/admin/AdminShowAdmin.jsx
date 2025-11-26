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
    const [itemsPerPage] = useState(20);
    const [databaseName, setDatabaseName] = useState("");
    const [currentAdminId, setCurrentAdminId] = useState("");

    const [editingAdmin, setEditingAdmin] = useState(null);
    const [deletingAdmin, setDeletingAdmin] = useState(null);

    const API_URL = "http://localhost:3001/api/users";

    useEffect(() => {
        const getCurrentAdminInfo = () => {
            console.log("=== ДІАГНОСТИКА LOCALSTORAGE ===");

            let dbName = localStorage.getItem('databaseName');
            let currentUserId = "";

            console.log("databaseName з localStorage:", dbName);

            // Спроба отримати з об'єкта user
            const userStr = localStorage.getItem('user');
            console.log("user з localStorage:", userStr);

            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    console.log("Розпарсений user:", user);

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

            // Спроба отримати з об'єкта userInfo
            const userInfoStr = localStorage.getItem('userInfo');
            console.log("userInfo з localStorage:", userInfoStr);

            if (userInfoStr) {
                try {
                    const userInfo = JSON.parse(userInfoStr);
                    console.log("Розпарсений userInfo:", userInfo);

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

            console.log("Результат:", { dbName, currentUserId });
            return { dbName, currentUserId };
        };

        const { dbName, currentUserId } = getCurrentAdminInfo();

        if (dbName) {
            setDatabaseName(dbName);
            // Встановлюємо currentAdminId навіть якщо він порожній
            setCurrentAdminId(currentUserId || "");
            console.log("Database name встановлено:", dbName);
            console.log("Current admin ID встановлено:", currentUserId || "не знайдено");
        } else {
            console.error("Database name не знайдено!");
            setError("Не вдалося визначити базу даних школи");
            setLoading(false);
        }
    }, []);

    // ОТРИМАТИ АДМІНІСТРАТОРІВ (БЕЗ ПОТОЧНОГО АДМІНІСТРАТОРА)
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
            console.log("Виконуємо запит адміністраторів...");

            const response = await axios.get(`${API_URL}/by-role/admin`, {
                params: { databaseName }
            });

            console.log("Отримано адміністраторів:", response.data);

            // Фільтруємо адміністраторів - виключаємо поточного, якщо currentAdminId не порожній
            const adminsWithoutCurrent = currentAdminId
                ? response.data.filter(admin => admin._id !== currentAdminId)
                : response.data;

            setAdmins(adminsWithoutCurrent);
            setFilteredAdmins(adminsWithoutCurrent);

            console.log("Всього адміністраторів:", response.data.length);
            console.log("Адміністраторів без поточного:", adminsWithoutCurrent.length);

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
        console.log("useEffect запущений, databaseName:", databaseName);
        if (databaseName) {
            fetchAdmins();
        } else {
            // Якщо databaseName не встановлено, зупиняємо завантаження
            setLoading(false);
        }
    }, [databaseName, currentAdminId]);

    // ПОШУК
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

    // СОРТУВАННЯ
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

    // ПАГІНАЦІЯ
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

    // ОБРОБНИКИ ПОПАПІВ
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

    if (loading) {
        return <LoadingState message="Завантаження адміністраторів..." />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={fetchAdmins} />;
    }

    return (
        <div>
            {/* {databaseName && (
                <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '4px'
                }}>
                    Показано адміністраторів: {filteredAdmins.length}
                    {currentAdminId && ` (без поточного адміністратора)`}
                    {!currentAdminId && ` (поточний адміністратор не визначений)`}
                </div>
            )} */}

            <AdminHeader
                adminCount={filteredAdmins.length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortOrder={sortOrder}
                onSortToggle={handleSortToggle}
            />

            {filteredAdmins.length === 0 && !loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px dashed #e5e7eb'
                }}>
                    <h4 style={{ marginBottom: '10px', color: '#374151' }}>
                        Інших адміністраторів не знайдено
                    </h4>
                    <p style={{ margin: 0 }}>
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
                        />
                    )}
                </>
            )}

            {/* ПОПАП РЕДАГУВАННЯ */}
            {editingAdmin && (
                <EditAdminPopup
                    admin={editingAdmin}
                    databaseName={databaseName}
                    onClose={closeEditPopup}
                    onUpdate={handleUpdateAdmin}
                />
            )}

            {/* ПОПАП ВИДАЛЕННЯ */}
            {deletingAdmin && (
                <DeleteAdminPopup
                    admin={deletingAdmin}
                    databaseName={databaseName}
                    onClose={closeDeletePopup}
                    onDelete={handleDeleteAdmin}
                />
            )}
        </div>
    );
};

export default AdminShowAdmin;