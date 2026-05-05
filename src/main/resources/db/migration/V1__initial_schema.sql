create table if not exists users (
    id uuid primary key,
    access_code varchar(6) not null unique,
    qr_code varchar(255) not null unique,
    qr_code_image_url text not null,
    read_only_access_code varchar(6) unique,
    read_only_qr_code varchar(255) unique,
    read_only_qr_code_image_url text,
    device_token varchar(2000) not null,
    user_type varchar(255),
    last_login timestamp,
    created_at timestamp not null,
    updated_at timestamp
);

create table if not exists hospitals (
    id uuid primary key,
    hospital_code varchar(255) not null unique,
    name varchar(255),
    region varchar(255),
    caregiver_secret_hash text,
    created_at timestamp not null,
    updated_at timestamp
);

create table if not exists patient_profiles (
    id uuid primary key,
    user_id uuid not null unique,
    surname varchar(255),
    first_name varchar(255),
    gender varchar(255),
    date_of_birth date,
    marital_status varchar(255),
    nationality varchar(255),
    hospital_id varchar(255),
    profile_complete boolean,
    created_at timestamp not null,
    updated_at timestamp,
    constraint fk_patient_profiles_user foreign key (user_id) references users(id),
    constraint fk_patient_profiles_hospital foreign key (hospital_id) references hospitals(hospital_code)
);

create table if not exists contact_demographic (
    id uuid primary key,
    user_id uuid not null unique,
    occupation varchar(255),
    num_children integer,
    social_security_type varchar(255),
    phone_number varchar(255),
    region varchar(255),
    address varchar(255),
    postal_code varchar(255),
    created_at timestamp not null,
    updated_at timestamp,
    constraint fk_contact_demographic_user foreign key (user_id) references users(id)
);

create table if not exists emergency_contacts (
    id uuid primary key,
    user_id uuid not null,
    full_name varchar(255),
    relationship varchar(255),
    phone_number varchar(255),
    residence varchar(255),
    priority_order integer,
    created_at timestamp not null,
    updated_at timestamp,
    constraint fk_emergency_contacts_user foreign key (user_id) references users(id)
);

create table if not exists medical_history (
    id uuid primary key,
    user_id uuid not null unique,
    chronic_conditions text,
    surgical_procedures text,
    ob_gyn_history text,
    created_at timestamp not null,
    updated_at timestamp,
    constraint fk_medical_history_user foreign key (user_id) references users(id)
);

create table if not exists allergies_lifestyle (
    id uuid primary key,
    user_id uuid not null unique,
    drug_allergies text,
    other_allergies text,
    smoking_status varchar(255),
    alcohol_consumption varchar(255),
    created_at timestamp not null,
    updated_at timestamp,
    constraint fk_allergies_lifestyle_user foreign key (user_id) references users(id)
);

create table if not exists caregivers (
    id uuid primary key,
    caregiver_user_id uuid not null unique,
    hospital_id varchar(255) not null,
    full_name varchar(255) not null,
    profession varchar(255),
    phone_number varchar(255),
    created_at timestamp not null,
    updated_at timestamp,
    constraint fk_caregivers_user foreign key (caregiver_user_id) references users(id),
    constraint fk_caregivers_hospital foreign key (hospital_id) references hospitals(hospital_code)
);

create table if not exists appointments (
    id uuid primary key,
    user_id uuid not null,
    created_by_caregiver_user_id uuid,
    doctor_name varchar(255),
    specialty varchar(255),
    appointment_date timestamp,
    status varchar(255),
    clinic_location varchar(255),
    phone_contact varchar(255),
    created_at timestamp not null,
    updated_at timestamp,
    constraint fk_appointments_patient foreign key (user_id) references users(id),
    constraint fk_appointments_caregiver foreign key (created_by_caregiver_user_id) references users(id)
);

create table if not exists medications (
    id uuid primary key,
    user_id uuid not null,
    name varchar(255) not null,
    dosage varchar(255),
    frequency varchar(255),
    start_date date,
    end_date date,
    created_at timestamp not null,
    updated_at timestamp,
    constraint fk_medications_user foreign key (user_id) references users(id)
);

create table if not exists vaccines (
    id uuid primary key,
    user_id uuid not null,
    vaccine_name varchar(255) not null,
    date_administered date,
    location varchar(255),
    next_reminder_date date,
    last_edited_by_user_id uuid,
    created_at timestamp not null,
    updated_at timestamp,
    constraint fk_vaccines_patient foreign key (user_id) references users(id),
    constraint fk_vaccines_editor foreign key (last_edited_by_user_id) references users(id)
);

create table if not exists audit_log (
    id uuid primary key,
    caregiver_id uuid not null,
    patient_user_id uuid not null,
    action varchar(255) not null,
    table_name varchar(255) not null,
    field_changes text,
    timestamp timestamp not null,
    constraint fk_audit_log_caregiver foreign key (caregiver_id) references users(id),
    constraint fk_audit_log_patient foreign key (patient_user_id) references users(id)
);

create index if not exists idx_patient_profiles_hospital_id on patient_profiles(hospital_id);
create index if not exists idx_caregivers_hospital_id on caregivers(hospital_id);
create index if not exists idx_emergency_contacts_user_id on emergency_contacts(user_id);
create index if not exists idx_appointments_user_id on appointments(user_id);
create index if not exists idx_medications_user_id on medications(user_id);
create index if not exists idx_vaccines_user_id on vaccines(user_id);
create index if not exists idx_audit_log_patient_user_id on audit_log(patient_user_id);
