import React from "react";

const ParentPage = ({ section }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">{section}</h2>
            <p>Інформація для батьків у розділі "{section}".</p>
        </div>
    );
};

export default ParentPage;
