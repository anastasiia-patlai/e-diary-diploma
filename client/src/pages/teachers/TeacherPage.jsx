import React from "react";

const TeacherPage = ({ section }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">{section}</h2>
            <p>Інформація для викладачів у розділі "{section}".</p>
        </div>
    );
};

export default TeacherPage;
