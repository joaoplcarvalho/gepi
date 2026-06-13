CREATE DATABASE IF NOT EXISTS gepi;
USE gepi;

-- ==========================
-- USUÁRIOS
-- ==========================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL
);

-- Usuário padrão para login
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES ('Administrador', 'admin@gepi.com', '123456', 'Administrador');

-- ==========================
-- COLABORADORES
-- ==========================
CREATE TABLE colaboradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    setor VARCHAR(100),
    cargo VARCHAR(100),
    telefone VARCHAR(20)
);

-- ==========================
-- EQUIPAMENTOS (EPIs)
-- ==========================
CREATE TABLE equipamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(100),
    quantidade INT NOT NULL DEFAULT 0,
    validade DATE
);

-- ==========================
-- EMPRÉSTIMOS
-- ==========================
CREATE TABLE emprestimos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    colaborador_id INT NOT NULL,
    equipamento_id INT NOT NULL,

    quantidade INT NOT NULL,

    data_retirada DATE,
    data_devolucao DATE,

    status VARCHAR(50),

    CONSTRAINT fk_emprestimo_colaborador
        FOREIGN KEY (colaborador_id)
        REFERENCES colaboradores(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emprestimo_equipamento
        FOREIGN KEY (equipamento_id)
        REFERENCES equipamentos(id)
        ON DELETE CASCADE
);
