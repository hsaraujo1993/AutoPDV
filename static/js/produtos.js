// produtos.js
const API_URL = '/api/v1/products/';
const categoriasCache = {};
const fornecedoresCache = {};

// DOM
const messagesDiv = document.getElementById('messages');
const formContainer = document.getElementById('form-container');
const tableBody = document.querySelector('#produtos-table tbody');

// ======= UTILIDADES =======
function showMessage(msg, type = 'success', timeout = 3000) {
    messagesDiv.innerHTML = `<div class="${type}">${msg}</div>`;
    setTimeout(() => (messagesDiv.innerHTML = ''), timeout);
}

// ======= CARREGAR CATEGORIAS / FORNECEDORES =======
async function loadCategorias() {
    try {
        const res = await fetch('/api/v1/categories/');
        const data = await res.json();
        data.forEach(c => (categoriasCache[c.id] = c.name));
    } catch (err) {
        console.error('Erro ao carregar categorias', err);
    }
}

async function loadFornecedores() {
    try {
        const res = await fetch('/api/v1/suppliers/');
        const data = await res.json();
        data.forEach(f => (fornecedoresCache[f.id] = f.name));
    } catch (err) {
        console.error('Erro ao carregar fornecedores', err);
    }
}

// ======= LISTAR PRODUTOS =======
async function loadProdutos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        renderProdutos(data);
    } catch (err) {
        console.error('Erro ao carregar produtos', err);
    }
}

function renderProdutos(data) {
    tableBody.innerHTML = '';
    data.forEach(p => {
        const id = p.product_id || p.id;
        const categoriaNome = categoriasCache[p.category] || '-';
        const fornecedorNome = fornecedoresCache[p.supplier] || '-';

        tableBody.innerHTML += `
            <tr>
                <td>${p.name || '-'}</td>
                <td>${p.sku || '-'}</td>
                <td>${p.oem_code || '-'}</td>
                <td>${p.oem_alternative_code || '-'}</td>
                <td>
                    ${p.status == 1 
                        ? '<span class="badge bg-success">Ativo</span>' 
                        : '<span class="badge bg-danger">Inativo</span>'}
                </td>
                <td><span class='badge bg-primary text-light'>${categoriaNome}</span></td>
                <td>${fornecedorNome}</td>
                <td>${p.description || '-'}</td>
                <td>
                  <div class="d-flex justify-content-center gap-2">
                    <button class="btn btn-success edit" onclick="editProduto('${id}')" data-bs-toggle="tooltip" title="Editar Produto">
                      Alterar
                    </button>
                    <button class="btn btn-danger delete" onclick="deleteProduto('${id}')" data-bs-toggle="tooltip" title="Excluir Produto">
                      Deletar
                    </button>
                  </div>
                </td>
            </tr>
        `;
    });

    // Inicializar tooltips Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
}

// ======= FORMULÁRIO =======
function showForm(produto = null) {
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <form id="produto-form" class="p-3 border rounded bg-light">
            <input type="hidden" name="id" value="${produto ? produto.product_id || produto.id : ''}">
            
            <div class="mb-3">
                <label class="form-label">Nome</label>
                <input type="text" class="form-control" name="name" value="${produto ? produto.name : ''}" required>
            </div>

            <div class="mb-3">
                <label class="form-label">SKU</label>
                <input type="text" class="form-control" name="sku" value="${produto ? produto.sku : ''}">
            </div>

            <div class="mb-3">
                <label class="form-label">OEM Code</label>
                <input type="text" class="form-control" name="oem_code" value="${produto ? produto.oem_code : ''}">
            </div>

            <div class="mb-3">
                <label class="form-label">OEM Alternative Code</label>
                <input type="text" class="form-control" name="oem_alternative_code" value="${produto ? produto.oem_alternative_code : ''}">
            </div>

            <div class="mb-3">
                <label class="form-label">Status</label>
                <select name="status" class="form-select">
                    <option value="1" ${produto && produto.status == 1 ? 'selected' : ''}>Ativo</option>
                    <option value="0" ${produto && produto.status == 0 ? 'selected' : ''}>Inativo</option>
                </select>
            </div>

            <div class="mb-3">
                <label class="form-label">Categoria</label>
                <select name="category" class="form-select">
                    ${Object.entries(categoriasCache)
                        .map(([id, nome]) => 
                            `<option value="${id}" ${produto && produto.category == id ? 'selected' : ''}>${nome}</option>`
                        ).join('')}
                </select>
            </div>

            <div class="mb-3">
                <label class="form-label">Fornecedor</label>
                <select name="supplier" class="form-select">
                    ${Object.entries(fornecedoresCache)
                        .map(([id, nome]) => 
                            `<option value="${id}" ${produto && produto.supplier == id ? 'selected' : ''}>${nome}</option>`
                        ).join('')}
                </select>
            </div>

            <div class="mb-3">
                <label class="form-label">Descrição</label>
                <textarea class="form-control" name="description">${produto ? produto.description : ''}</textarea>
            </div>

            <div class="d-flex justify-content-end gap-2">
                <button type="submit" class="btn btn-primary">Salvar</button>
                <button type="button" class="btn btn-secondary" onclick="formContainer.style.display='none'">Cancelar</button>
            </div>
        </form>
    `;

    document.getElementById('produto-form').addEventListener('submit', saveProduto);
}

// ======= CRUD =======
async function saveProduto(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');

    const payload = Object.fromEntries(formData.entries());

    try {
        const res = await fetch(id ? `${API_URL}${id}/` : API_URL, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            showMessage(id ? 'Produto atualizado!' : 'Produto criado!');
            formContainer.style.display = 'none';
            loadProdutos();
        } else {
            showMessage('Erro ao salvar produto', 'error');
        }
    } catch (err) {
        console.error('Erro ao salvar produto', err);
    }
}

async function editProduto(id) {
    try {
        const res = await fetch(`${API_URL}${id}/`);
        const produto = await res.json();
        showForm(produto);
    } catch (err) {
        console.error('Erro ao buscar produto', err);
    }
}

async function deleteProduto(id) {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    try {
        const res = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
        if (res.ok) {
            showMessage('Produto excluído!');
            loadProdutos();
        } else {
            showMessage('Erro ao excluir produto', 'error');
        }
    } catch (err) {
        console.error('Erro ao excluir produto', err);
    }
}

// ======= INIT =======
(async function init() {
    await loadCategorias();
    await loadFornecedores();
    loadProdutos();
})();
