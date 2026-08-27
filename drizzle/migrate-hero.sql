-- 迁移文章头图到 R2（非破坏性 UPDATE）
update posts set hero_image = 'https://blog.larson.it.com/media/uploads/2026-08-27/fe84e4f7-blog-placeholder-3.jpg' where slug = 'first-post';
update posts set hero_image = 'https://blog.larson.it.com/media/uploads/2026-08-27/c18e1d4f-blog-placeholder-1.jpg' where slug = 'markdown-style-guide';
update posts set hero_image = 'https://blog.larson.it.com/media/uploads/2026-08-27/0a82191c-blog-placeholder-4.jpg' where slug = 'second-post';
update posts set hero_image = 'https://blog.larson.it.com/media/uploads/2026-08-27/14cefa54-blog-placeholder-2.jpg' where slug = 'third-post';
update posts set hero_image = 'https://blog.larson.it.com/media/uploads/2026-08-27/429e2c75-blog-placeholder-5.jpg' where slug = 'using-mdx';
