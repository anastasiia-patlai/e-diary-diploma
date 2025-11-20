import React, { useState, useEffect } from 'react';
import axios from "axios";
import AdminHeader from './AdminHeader';
import AdminList from './AdminList';
import AdminPagination from './AdminPagination';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const AdminShowAdmin = () => {
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    const API_URL = "http://localhost:3001/api/users";

    // ОТРИМАТИ АДМІНІСТРАТОРІВ
    const fetchAdmins = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get(`${API_URL}/by-role/admin`);
            setAdmins(response.data);
            setFilteredAdmins(response.data);
        } catch (err) {
            console.error("Помилка завантаження адміністраторів:", err);
            setError(err.response?.data?.error || "Помилка завантаження адміністраторів");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

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

    // ВИДАЛЕННЯ
    const handleDelete = async (adminId) => {
        if (window.confirm("Ви впевнені, що хочете видалити цього адміністратора?")) {
            try {
                await axios.delete(`${API_URL}/${adminId}`);
                fetchAdmins();
            } catch (err) {
                console.error("Помилка видалення адміністратора:", err);
                alert(err.response?.data?.error || "Помилка видалення адміністратора");
            }
        }
    };

    // РЕДАГУВАННЯ
    const handleEdit = (admin) => {
        console.log("Редагувати адміністратора:", admin);
        alert("Функція редагування буде реалізована пізніше");
    };

    if (loading) {
        return <LoadingState message="Завантаження адміністраторів..." />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={fetchAdmins} />;
    }

    return (
        <div>
            <AdminHeader
                adminCount={filteredAdmins.length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortOrder={sortOrder}
                onSortToggle={handleSortToggle}
            />

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
        </div>
    );
};

export default AdminShowAdmin;