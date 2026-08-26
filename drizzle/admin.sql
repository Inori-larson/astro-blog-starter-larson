-- 管理员账号（由 scripts/create-admin.mjs 生成）
delete from users where email = '935636808@qq.com';
insert into users (email, password_hash, name, role, created_at) values ('935636808@qq.com', 'pbkdf2$100000$967912ab313bca0acbb4593c6ceb6d97$5224f533ea2adc6bf393898b20a70775bce128d188e3b3f4545f34f8fb775906', 'Larson', 'admin', 1787729674032);