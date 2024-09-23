export enum Gender {
    M = "M",
    F = "F",
}

export enum UserType {
    ADMIN = "ADMIN",
    STAFF = "STAFF",
    DOCTOR = "DOCTOR",
}

export enum FilePurpose {
    DOCTOR_AVATAR = "DOCTOR_AVATAR",
    PATIENT_EMR = "PATIENT_EMR",
    SUPPLIER_AVATAR = "SUPPLIER_AVATAR",
    STAFF_AVATAR = "STAFF_AVATAR",
    DRUG_AVATAR = "DRUG_AVATAR",
    BARCODE = "BARCODE",
}

export enum RoutesOfAdministration {
    ORAL = "ORAL",
    SUBLINGUAL = "SUBLINGUAL",
    BUCCAL = "BUCCAL",
    INTRAVENOUS = "INTRAVENOUS",
    INTRAMUSCULAR = "INTRAMUSCULAR",
    SUBCUTANEOUS = "SUBCUTANEOUS",
    INHALATION = "INHALATION",
    NASAL = "NASAL",
    RECTAL = "RECTAL",
    VAGINAL = "VAGINAL",
    CUTANEOUS = "CUTANEOUS",
    OTIC = "OTIC",
    OCULAR = "OCULAR",
    TRANSDERMAL = "TRANSDERMAL",
}

export enum UnitsOfMeasurements {
    MICROGRAM = "μg",
    MILLIGRAM = "mg",
    GRAM = "g",
    KILOGRAM = "kg",
    LITRE = "l",
    MILLILITRE = "ml",
    CC = "cc",
    MOL = "mol",
    MILIMOL = "mmol",
}

export enum BuySellUnits {
    BOX = "BOX",
    BOTTLE = "BOTTLE",
    UNIT = "UNIT",
    TABLET = "TABLET",
    CARD = "CARD",
}

export enum PaymentMethods {
    CASH = "CASH",
    CREDIT = "CREDIT",
}

export enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
}

export enum AlertType {
    EXPIRED_NEAR = "expired_near",
    EXPIRED_PAST = "expired_past",
    PAYMENT_NEAR = "payment_near",
    PAYMENT_DUE = "payment_due",
    ARRIVAL_NEAR = "arrival_near",
    ARRIVAL_DUE = "arrival_due",
}

export enum NotificationType {
    MEDICINE = "MEDICINE",
    ORDER = "ORDER",
}
