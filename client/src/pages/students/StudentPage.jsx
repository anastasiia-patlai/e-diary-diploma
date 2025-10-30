import React from "react";

const StudentPage = ({ section }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">{section}</h2>
            <p>Вітаємо, студенте! Тут буде інформація розділу "{section}".</p>
        </div>
    );
};

export default StudentPage;
