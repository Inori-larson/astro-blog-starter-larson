-- 管理员账号（由 scripts/create-admin.mjs 生成）
delete from users where email = 'admin@larson.dev';
insert into users (email, password_hash, name, role, created_at) values ('admin@larson.dev', 'pbkdf2$100000$7303bf30a78af989abb3a6f646f9f537$a1ac3c8a63e7bed8a357371c92d534994a9b4954e55c01340df2e44bf27d7598', 'Larson', 'admin', 1787726648174);