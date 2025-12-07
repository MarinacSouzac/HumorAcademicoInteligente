
// CONFIGURAÇÕES INICIAIS

// URL base da API
const API = "http://localhost:3000";

// Elementos do DOM
const grid = document.getElementById("grid");                  // Container dos cards de humor
const modal = document.getElementById("resultado");            // Modal de visualização do humor
const close = document.getElementById("close");                // Botão de fechar modal
const estatisticasDiv = document.getElementById("estatisticas"); // Container das estatísticas
const formHumor = document.getElementById("formHumor");        // Formulário de criação/edição de humor

// Inputs do formulário
const humorInput = document.getElementById("humorInput");
const cor1 = document.getElementById("cor1");
const cor2 = document.getElementById("cor2");
const cor3 = document.getElementById("cor3");
const frasesInput = document.getElementById("frasesInput");
const dicasInput = document.getElementById("dicasInput");
const musicasInput = document.getElementById("musicasInput");
const snacksInput = document.getElementById("snacksInput");
const emojisInput = document.getElementById("emojisInput");
const metasInput = document.getElementById("metasInput");
const descansoInput = document.getElementById("descansoInput");

// Variáveis de controle
let humorAtualId = null;  // Guarda o ID do humor que está sendo visualizado/editar
let modoEdicao = false;    // Flag para saber se o formulário está em modo edição

// Elementos dentro do modal
const frasesList = document.getElementById("frasesList");
const dicasList = document.getElementById("dicasList");
const musicasList = document.getElementById("musicasList");
const snacksList = document.getElementById("snacksList");
const emojisList = document.getElementById("emojisList");
const metasList = document.getElementById("metasList");
const descansoList = document.getElementById("descansoList");
const coresContainer = document.getElementById("cores");
const humorTitle = document.getElementById("humor-title");

// Botões de ação no modal
const btnEditar = document.getElementById("editarHumor");
const btnDeletar = document.getElementById("deletarHumor");


// CARREGAR HUMORES

// Busca todos os humores da API e cria os cards
async function carregarHumores() {
  try {
    const res = await fetch(`${API}/humores`);
    const humores = await res.json();

    grid.innerHTML = ""; // Limpa o grid antes de adicionar novos cards

    humores.forEach(h => criarCard(h)); // Cria um card para cada humor
  } catch (err) {
    console.error("Erro ao carregar humores:", err);
  }
}



// CRIAR CARD DE HUMOR

function criarCard(h) {
  const card = document.createElement("div"); // Cria div do card
  card.classList.add("card");                 // Adiciona classe CSS

  card.style.background = h.cores?.[0] || "#6c63ff"; // Cor do card (primeira cor do humor ou default)

  card.dataset.id = h._id; // Armazena o ID do humor no dataset
  card.innerText = h.humor; // Texto do card = nome do humor

  card.addEventListener("click", () => abrirHumor(h._id)); // Abre modal ao clicar

  grid.appendChild(card); // Adiciona card ao grid
}



// ABRIR MODAL DO HUMOR


async function abrirHumor(id) {
  try {
    humorAtualId = id;

    const res = await fetch(`${API}/humores/${id}`);
    const dados = await res.json();

    // Preencher título
    humorTitle.textContent = dados.humor;

    // Preencher listas do modal
    preencherLista(frasesList, dados.frases);
    preencherLista(dicasList, dados.dicas_estudo);
    preencherLista(musicasList, dados.musicas);
    preencherLista(snacksList, dados.snacks);
    preencherLista(emojisList, dados.emojis);
    preencherLista(metasList, dados.metas_rapidas);
    preencherLista(descansoList, dados.descanso);

    // Preencher cores
    coresContainer.innerHTML = "";
    (dados.cores || []).forEach(c => {
      const box = document.createElement("div");
      box.style.background = c;
      coresContainer.appendChild(box);
    });

    // Registrar estatística de visualização
    await fetch(`${API}/estatisticas/registrar/${id}`, { method: "POST" });

    carregarEstatisticas(); // Atualiza estatísticas

    modal.classList.remove("hidden"); // Abre modal
  } catch (err) {
    console.log("Erro ao abrir humor:", err);
  }
}

// Função auxiliar para preencher uma lista
function preencherLista(ul, arr = []) {
  ul.innerHTML = ""; // Limpa lista
  arr.forEach(item => {
    if (!item.trim()) return; // Ignora strings vazias
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });
}


// FECHAR MODAL

close.onclick = () => modal.classList.add("hidden"); // Fechar clicando no X
window.onclick = e => {
  if (e.target === modal) modal.classList.add("hidden"); // Fechar clicando fora do modal
};


// ESTATÍSTICAS


async function carregarEstatisticas() {
  try {
    const res = await fetch(`${API}/estatisticas`);
    const stats = await res.json();

    estatisticasDiv.innerHTML = ""; // Limpa antes de adicionar

    stats.forEach(s => {
      let ultima = "Nunca"; // Valor padrão caso não haja consultas

      if (s.ultimaConsultas?.length) {
        const u = s.ultimaConsultas.at(-1);
        ultima = new Date(u).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
      }

      const card = document.createElement("div");
      card.classList.add("stat-card");

      card.innerHTML = `
        <strong>${s.humor}</strong><br>
        Uso: ${s.uso}<br>
        Última consulta: ${ultima}
      `;

      estatisticasDiv.appendChild(card);
    });

  } catch (err) {
    console.log("Erro ao carregar estatísticas:", err);
  }
}


// BOTÃO EDITAR HUMOR


btnEditar.addEventListener("click", async () => {
  if (!humorAtualId) return;

  modoEdicao = true; // Ativa modo edição

  const res = await fetch(`${API}/humores/${humorAtualId}`);
  const dados = await res.json();

  // Preencher inputs com os dados do humor
  humorInput.value = dados.humor;
  cor1.value = dados.cores?.[0] || "#000000";
  cor2.value = dados.cores?.[1] || "#000000";
  cor3.value = dados.cores?.[2] || "#000000";

  frasesInput.value = dados.frases.join(", ");
  dicasInput.value = dados.dicas_estudo.join(", ");
  musicasInput.value = dados.musicas.join(", ");
  snacksInput.value = dados.snacks.join(", ");
  emojisInput.value = dados.emojis.join(", ");
  metasInput.value = dados.metas_rapidas.join(", ");
  descansoInput.value = dados.descanso.join(", ");

  modal.classList.add("hidden"); // Fecha modal
  formHumor.querySelector("button").innerText = "Salvar Alterações";
  document.querySelector("#cadastro-section h2").innerText = "Editar Humor";

  humorInput.focus(); // Foca no input
  window.scrollTo({ top: 0, behavior: "smooth" }); // Rola para o topo
});


// BOTÃO DELETAR HUMOR


btnDeletar.addEventListener("click", async () => {
  if (!humorAtualId) return;
  if (!confirm("Tem certeza que deseja deletar este humor?")) return;

  await fetch(`${API}/humores/${humorAtualId}`, { method: "DELETE" });

  modal.classList.add("hidden");

  carregarHumores();
  carregarEstatisticas();
});


// SALVAR FORMULÁRIO (CRIAR OU EDITAR)


formHumor.onsubmit = async e => {
  e.preventDefault();

  const nome = humorInput.value.trim();

  // Verificar se o nome já existe
  const resNome = await fetch(`${API}/humores/filtro?humor=${encodeURIComponent(nome)}`);
  const existentes = await resNome.json();

  if (modoEdicao) {
    if (existentes.length > 0 && existentes[0]._id !== humorAtualId) {
      return alert("Esse nome já existe em outro humor!");
    }
  } else {
    if (existentes.length > 0) {
      return alert("Esse humor já existe!");
    }
  }

  // Montar corpo da requisição
  const body = {
    humor: nome,
    cores: [cor1.value, cor2.value, cor3.value].filter(Boolean),
    frases: frasesInput.value.split(",").map(s => s.trim()).filter(Boolean),
    dicas_estudo: dicasInput.value.split(",").map(s => s.trim()).filter(Boolean),
    musicas: musicasInput.value.split(",").map(s => s.trim()).filter(Boolean),
    snacks: snacksInput.value.split(",").map(s => s.trim()).filter(Boolean),
    emojis: emojisInput.value.split(",").map(s => s.trim()).filter(Boolean),
    metas_rapidas: metasInput.value.split(",").map(s => s.trim()).filter(Boolean),
    descanso: descansoInput.value.split(",").map(s => s.trim()).filter(Boolean)
  };

  try {
    if (modoEdicao) {
      // Atualizar humor existente
      await fetch(`${API}/humores/${humorAtualId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      modoEdicao = false;
      humorAtualId = null;
      formHumor.querySelector("button").innerText = "Criar Humor";
      document.querySelector("#cadastro-section h2").innerText = "Criar Novo Humor";

    } else {
      // Criar novo humor
      await fetch(`${API}/humores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    }

    alert("Salvo com sucesso!");

    formHumor.reset();        // Limpa formulário
    carregarHumores();         // Atualiza grid
    carregarEstatisticas();    // Atualiza estatísticas

  } catch (err) {
    console.log("Erro ao salvar humor:", err);
  }
};


// INICIALIZAÇÃO

// Ao carregar a página, carrega os humores e estatísticas
carregarHumores();
carregarEstatisticas();
