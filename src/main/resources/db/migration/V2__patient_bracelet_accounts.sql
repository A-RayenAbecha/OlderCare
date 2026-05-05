alter table users add column if not exists full_name varchar(255);
alter table users add column if not exists email varchar(255);
alter table users add column if not exists password_hash varchar(255);
alter table users add column if not exists bracelet_code varchar(255);

update users
set bracelet_code = access_code
where bracelet_code is null
  and exists (
      select 1
      from information_schema.columns
      where table_name = 'users'
        and column_name = 'access_code'
  );

update users
set full_name = coalesce(nullif(trim(patient_profiles.first_name || ' ' || patient_profiles.surname), ''), 'Patient')
from patient_profiles
where users.id = patient_profiles.user_id
  and users.full_name is null;

update users
set full_name = 'Patient'
where full_name is null;

update users
set email = lower('legacy-' || id || '@oldercare.local')
where email is null;

update users
set password_hash = 'LEGACY_PASSWORD_NOT_SET'
where password_hash is null;

update users
set bracelet_code = upper(replace(id::text, '-', ''))
where bracelet_code is null;

alter table vaccines drop constraint if exists fk_vaccines_editor;
update vaccines
set last_edited_by_user_id = user_id
where last_edited_by_user_id in (select id from users where user_type = 'CAREGIVER');

alter table appointments drop constraint if exists fk_appointments_caregiver;
alter table appointments drop column if exists created_by_caregiver_user_id;

drop table if exists audit_log cascade;
drop table if exists caregivers cascade;

delete from users
where user_type = 'CAREGIVER';

update users
set user_type = 'PATIENT'
where user_type is null
   or user_type <> 'PATIENT';

update users
set qr_code = 'OLDERCARE-BRACELET:' || bracelet_code
where qr_code is null
   or qr_code = '';

alter table users alter column full_name set not null;
alter table users alter column email set not null;
alter table users alter column password_hash set not null;
alter table users alter column bracelet_code set not null;
alter table users alter column qr_code set not null;
alter table users alter column user_type set not null;

create unique index if not exists uk_users_email on users (lower(email));
create unique index if not exists uk_users_bracelet_code on users (bracelet_code);
create unique index if not exists uk_users_qr_code on users (qr_code);

alter table users drop column if exists access_code;
alter table users drop column if exists qr_code_image_url;
alter table users drop column if exists read_only_access_code;
alter table users drop column if exists read_only_qr_code;
alter table users drop column if exists read_only_qr_code_image_url;
alter table hospitals drop column if exists caregiver_secret_hash;

drop index if exists idx_caregivers_hospital_id;
drop index if exists idx_audit_log_patient_user_id;
