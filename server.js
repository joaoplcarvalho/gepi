const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// 🔥 SERVIR HTML (ESSA LINHA RESOLVE SEU ERRO)
app.use(express.static('public'));

// TESTE
app.get('/', (req, res) => {
  res.send('Servidor rodando 🚀');
});

// 🔐 LOGIN
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  db.query(
    'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
    [email, senha],
    (err, result) => {
      if (err) return res.send(err);

      if (result.length > 0) {
        res.json({
          success: true,
          usuario: {
            id: result[0].id,
            nome: result[0].nome,
            email: result[0].email,
            tipo: result[0].tipo
          }
        });
      } else {
        res.json({ success: false });
      }
    }
  );
});


// ================= USUÁRIOS =================

// LISTAR
app.get('/usuarios', (req, res) => {
  db.query('SELECT id, nome, email, tipo FROM usuarios', (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

// DELETAR
app.delete('/usuarios/:id', (req, res) => {
  db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.send(err);
    res.send('Deletado!');
  });
});

// ================= EQUIPAMENTOS =================

// LISTAR
app.get('/equipamentos', (req, res) => {
  db.query('SELECT * FROM equipamentos', (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

// BUSCAR
app.get('/equipamentos/busca/:nome', (req, res) => {
  const nome = req.params.nome;

  db.query(
    'SELECT * FROM equipamentos WHERE nome LIKE ?',
    [`%${nome}%`],
    (err, result) => {
      if (err) return res.send(err);
      res.json(result);
    }
  );
});

// CADASTRAR
app.post('/equipamentos', (req, res) => {
  const { nome, tipo, quantidade, validade } = req.body;

  db.query(
    'INSERT INTO equipamentos (nome, tipo, quantidade, validade) VALUES (?, ?, ?, ?)',
    [nome, tipo, quantidade, validade],
    (err) => {
      if (err) return res.send(err);
      res.send('Equipamento cadastrado!');
    }
  );
});

// ATUALIZAR
app.put('/equipamentos/:id', (req, res) => {
  const { nome, tipo, quantidade, validade } = req.body;

  db.query(
    'UPDATE equipamentos SET nome=?, tipo=?, quantidade=?, validade=? WHERE id=?',
    [nome, tipo, quantidade, validade, req.params.id],
    (err) => {
      if (err) return res.send(err);
      res.send('Atualizado!');
    }
  );
});

// DELETAR
app.delete('/equipamentos/:id', (req, res) => {
  db.query(
    'DELETE FROM equipamentos WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.send(err);
      res.send('Deletado!');
    }
  );
});

// ================= EMPRÉSTIMOS =================

// LISTAR (COM JOIN 🔥)
app.get('/emprestimos', (req, res) => {
  db.query(`
    SELECT e.id, c.nome AS colaborador, eq.nome AS equipamento,
           e.quantidade,
           e.data_retirada, e.data_devolucao, e.status
    FROM emprestimos e
    JOIN colaboradores c ON e.colaborador_id = c.id
    JOIN equipamentos eq ON e.equipamento_id = eq.id
  `, (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

// CADASTRAR (COM QUANTIDADE 🔥🔥🔥)
app.post('/emprestimos', (req, res) => {
  const { colaborador_id, equipamento_id, quantidade, data_devolucao } = req.body;

  // 1️⃣ Verificar estoque
  db.query(
    'SELECT quantidade FROM equipamentos WHERE id = ?',
    [equipamento_id],
    (err, result) => {
      if (err) return res.send(err);

      const estoque = result[0].quantidade;

      if (quantidade > estoque) {
        return res.send('Estoque insuficiente!');
      }

      // 2️⃣ Criar empréstimo
      db.query(
        `INSERT INTO emprestimos 
        (colaborador_id, equipamento_id, quantidade, data_retirada, data_devolucao, status)
        VALUES (?, ?, ?, CURDATE(), ?, 'Em uso')`,
        [colaborador_id, equipamento_id, quantidade, data_devolucao],
        (err) => {
          if (err) return res.send(err);

          // 3️⃣ Baixar estoque
          db.query(
            'UPDATE equipamentos SET quantidade = quantidade - ? WHERE id = ?',
            [quantidade, equipamento_id]
          );

          res.send('Empréstimo realizado!');
        }
      );
    }
  );
});

// DEVOLVER 🔥🔥🔥
app.put('/emprestimos/devolver/:id', (req, res) => {

  db.query(
    'SELECT equipamento_id, quantidade FROM emprestimos WHERE id = ?',
    [req.params.id],
    (err, result) => {
      if (err) return res.send(err);

      const equipamento_id = result[0].equipamento_id;
      const quantidade = result[0].quantidade;

      // Atualiza status
      db.query(
        `UPDATE emprestimos 
         SET status = 'Devolvido', data_devolucao = CURDATE()
         WHERE id = ?`,
        [req.params.id]
      );

      // Devolve estoque
      db.query(
        'UPDATE equipamentos SET quantidade = quantidade + ? WHERE id = ?',
        [quantidade, equipamento_id]
      );

      res.send('Devolvido com sucesso!');
    }
  );
});

// ================= COLABORADORES =================

// BUSCAR
app.get('/colaboradores/busca/:nome', (req, res) => {
  const nome = req.params.nome;

  db.query(
    'SELECT * FROM colaboradores WHERE nome LIKE ?',
    [`%${nome}%`],
    (err, result) => {
      if (err) return res.send(err);
      res.json(result);
    }
  );
});

// LISTAR
app.get('/colaboradores', (req, res) => {
  db.query('SELECT * FROM colaboradores', (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

// CADASTRAR
app.post('/colaboradores', (req, res) => {
  const { nome, setor, cargo, telefone } = req.body;

  db.query(
    'INSERT INTO colaboradores (nome, setor, cargo, telefone) VALUES (?, ?, ?, ?)',
    [nome, setor, cargo, telefone],
    (err) => {
      if (err) return res.send(err);
      res.send('Colaborador cadastrado!');
    }
  );
});

// DELETAR
app.delete('/colaboradores/:id', (req, res) => {
  db.query(
    'DELETE FROM colaboradores WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.send(err);
      res.send('Deletado!');
    }
  );
});

// ATUALIZAR
app.put('/colaboradores/:id', (req, res) => {
  const { nome, setor, cargo, telefone } = req.body;

  db.query(
    'UPDATE colaboradores SET nome=?, setor=?, cargo=?, telefone=? WHERE id=?',
    [nome, setor, cargo, telefone, req.params.id],
    (err) => {
      if (err) return res.send(err);
      res.send('Atualizado!');
    }
  );
});


// 🚀 SERVIDOR
app.listen(3000, () => {
  console.log('Servidor em http://localhost:3000');
});