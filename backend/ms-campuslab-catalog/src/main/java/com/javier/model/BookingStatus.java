package com.javier.model;


public enum ookingStatus {
    SOLICITADA,
    APROBADA,
    EN_PREPARACION,
    EN_USO,
    DEVUELTA,
    CANCELADA;

    // Validación estricta de transiciones según reglas del negocio CampusLab
    public boolean canTransitionTo(BookingStatus nextStatus) {
        if (this == nextStatus) return true;

        return switch (this) {
            case SOLICITADA -> nextStatus == APROBADA || nextStatus == CANCELADA;
            case APROBADA -> nextStatus == EN_PREPARACION || nextStatus == CANCELADA;
            case EN_PREPARACION -> nextStatus == EN_USO || nextStatus == CANCELADA;
            case EN_USO -> nextStatus == DEVUELTA;
            case DEVUELTA, CANCELADA -> false; // Estados finales
        };
    }
}