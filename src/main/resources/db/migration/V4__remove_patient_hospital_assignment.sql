alter table patient_profiles drop constraint if exists fk_patient_profiles_hospital;
drop index if exists idx_patient_profiles_hospital_id;
alter table patient_profiles drop column if exists hospital_id;
drop table if exists hospitals cascade;
