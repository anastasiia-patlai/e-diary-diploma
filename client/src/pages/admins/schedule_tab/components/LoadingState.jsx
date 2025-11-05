import React from "react";
import { Container, Spinner } from "react-bootstrap";

const LoadingState = () => {
    return (
        <Container style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh"
        }}>
            <div style={{ textAlign: "center" }}>
                <Spinner animation="border" variant="primary" />
                <p style={{ marginTop: "8px", color: "#6b7280" }}>Завантаження розкладу...</p>
            </div>
        </Container>
    );
};

export default LoadingState;