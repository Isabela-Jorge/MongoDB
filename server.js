const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// 1. Conexão com o MongoDB local (porta padrão 27017)
mongoose.connect('mongodb://127.0.0.1:27017/tarefas_db')
  .then(() => console.log('>>> [MONGODB] Conectado com sucesso ao banco tarefas_db! <<<'))
  .catch(err => console.error('>>> [MONGODB] Falha de conexao:', err.message));

// 2. Modelo do Documento (Schema NoSQL)
const TarefaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  responsavel: { type: String, required: true },
  prioridade: { type: String, enum: ['Baixa', 'Media', 'Alta'], default: 'Media' },
  tags: [String], // Vetor nativo de strings
  concluida: { type: Boolean, default: false },
  detalhesExtras: mongoose.Schema.Types.Mixed // Campo Schemaless dinâmico
}, { 
  timestamps: true // Cria automaticamente createdAt e updatedAt
});

const Tarefa = mongoose.model('Tarefa', TarefaSchema);

// 3. Rotas CRUD da API REST

// [READ] Listar todos os documentos
app.get('/api/tarefas', async (req, res) => {
  try {
    const tarefas = await Tarefa.find().sort({ createdAt: -1 });
    res.status(200).json(tarefas);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// [CREATE] Gravar novo documento
app.post('/api/tarefas', async (req, res) => {
  try {
    const novaTarefa = await Tarefa.create(req.body);
    res.status(201).json(novaTarefa);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// [UPDATE COMPLETO] Editar documento por ID (PUT)
app.put('/api/tarefas/:id', async (req, res) => {
  try {
    const atualizada = await Tarefa.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!atualizada) return res.status(404).json({ erro: 'Documento nao encontrado' });
    res.status(200).json(atualizada);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// [UPDATE PARCIAL] Alternar status concluída (PATCH)
app.patch('/api/tarefas/:id', async (req, res) => {
  try {
    const tarefa = await Tarefa.findById(req.params.id);
    if (!tarefa) return res.status(404).json({ erro: 'Documento nao encontrado' });
    
    tarefa.concluida = !tarefa.concluida;
    await tarefa.save();
    res.status(200).json(tarefa);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// [DELETE] Excluir documento por ID (DELETE)
app.delete('/api/tarefas/:id', async (req, res) => {
  try {
    const removida = await Tarefa.findByIdAndDelete(req.params.id);
    if (!removida) return res.status(404).json({ erro: 'Documento nao encontrado' });
    res.status(200).json({ mensagem: 'Documento removido com sucesso!', id: req.params.id });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// 4. Inicialização do Servidor na porta 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`>>> Servidor Backend rodando em http://127.0.0.1:${PORT} <<<`);
});