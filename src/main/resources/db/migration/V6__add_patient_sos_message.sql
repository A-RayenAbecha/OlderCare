alter table patient_profiles
    add column if not exists sos_message text;

update patient_profiles
set sos_message = 'SOS: I need immediate help. Please contact me or come to my location.'
where sos_message is null
   or trim(sos_message) = '';
