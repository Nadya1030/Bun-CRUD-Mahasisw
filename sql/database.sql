CREATE DATABASE IF NOT EXISTS kampus;
USE kampus;

CREATE TABLE IF NOT EXISTS mahasiswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100),
  jurusan VARCHAR(100),
  angkatan INT
);

INSERT INTO mahasiswa (nama, jurusan, angkatan) VALUES
  ('Andi', 'Sistem Informasi', 2022),
  ('Siti', 'Informatika', 2023);
