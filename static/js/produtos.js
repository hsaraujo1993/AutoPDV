// produtos.js
const API_URL = '/api/v1/products/';
const API_CATEGORIES_URL = '/categories/';

const messagesDiv = document.getElementById('messages');
const formContainer = document.getElementById('form-container');
const tableBody = document.querySelector('#produtos-table tbody');

// ======= UTILIDADES =======
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showMessage(msg, type = 'success', timeout = 3000) {
    messagesDiv.innerHTML = `<div class="${type}">${msg}</div>`;
    setTimeout(() => messagesDiv.innerHTML = '', timeout);
}

function showLoading() {
    messagesDiv.innerHTML = '<div class="loading">Carregando...</div>';
}

function hideLoading() {
    messagesDiv.innerHTML = '';
}

// ======= FETCH PRODUTOS =======
async function fetchProdutos() {
    showLoading();
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        renderProdutos(data);
    } catch (err) {
        showMessage('Erro ao carregar produtos: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ======= RENDER =======
function renderProdutos(data) {
    tableBody.innerHTML = '';
    data.forEach(p => {
        const id = p.product_id || p.id;
        const categoriaBadge = p.category_name ? `<span class='badge bg-primary text-light'>${p.category_name}</span>` : '-';
        tableBody.innerHTML += `
            <tr>
                <td>${p.name ? p.name : '-'}</td>
                <td>${categoriaBadge}</td>
                <td>${p.supplier_name ? p.supplier_name : '-'}</td>
                <td>${p.description ? p.description : '-'}</td>
                <td class="text-center">
                    <button class="btn btn-success edit me-2" onclick="editProduto('${id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Editar Produto">
                        <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M16.5 5.5l2 2a2 2 0 010 2.83l-8.5 8.5a2 2 0 01-1.41.59H5v-3.09a2 2 0 01.59-1.41l8.5-8.5a2 2 0 012.91 0z'/></svg>
                        Editar
                    </button>
                    <button class="btn btn-danger delete" onclick="deleteProduto('${id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Excluir Produto">
                        <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M6 7h12M9 7V5a3 3 0 016 0v2m-7 0h8m-9 2v10a2 2 0 002 2h6a2 2 0 002-2V9'/></svg>
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });
    // Inicializa tooltips Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// ======= FORM FUNCTIONS =======
async function showForm(id = null) {
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <div class="form-card">
            <form id="produto-form">
                <input type="text" name="name" placeholder="Nome" required>
                <input type="text" name="sku" placeholder="SKU" required>
                <input type="text" name="description" placeholder="Descrição">
                <select name="category" required></select>
                <select name="supplier"></select>
                <button type="submit" class="btn create-btn">Salvar</button>
                e
            </form>
        </div>
    `;

    await populateSelect(API_CATEGORIES_URL, 'category');
    await populateSelect(API_SUPPLIERS_URL, 'supplier');

    const form = document.getElementById('produto-form');
    if (id) {
        await populateForm(id);
        form.onsubmit = e => { e.preventDefault(); updateProduto(id); };
    } else {
        form.onsubmit = e => { e.preventDefault(); createProduto(); };
    }
}

function hideForm() {
    formContainer.style.display = 'none';
    formContainer.innerHTML = '';
}

async function populateSelect(url, selectName) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const items = await res.json();
        const select = formContainer.querySelector(`select[name=${selectName}]`);
        let options = `<option value="">Selecione...</option>`;
        options += items.map(i => `<option value="${i.id}">${i.name}</option>`).join('');
        select.innerHTML = options;
    } catch {
        showMessage(`Erro ao carregar ${selectName}s`, 'error');
    }
}

async function populateForm(id) {
    try {
        const res = await fetch(API_URL + id + '/');
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const p = await res.json();
        document.querySelector('input[name=name]').value = p.name;
        document.querySelector('input[name=sku]').value = p.sku;
        document.querySelector('input[name=description]').value = p.description;
        document.querySelector('select[name=category]').value = p.category;
        document.querySelector('select[name=supplier]').value = p.supplier;
    } catch {
        showMessage('Erro ao carregar produto.', 'error');
    }
}

// ======= CRUD FUNCTIONS =======
async function createProduto() {
    const form = document.getElementById('produto-form');
    const data = Object.fromEntries(new FormData(form));
    const csrftoken = getCookie('csrftoken');
    if (!data.supplier) delete data.supplier;
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken, // Adiciona o cabeçalho CSRF
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        hideForm();
        fetchProdutos();
        showMessage('Produto cadastrado com sucesso!', 'success');
    } catch {
        showMessage('Erro ao cadastrar produto.', 'error');
    }
}

function editProduto(id) {
    showForm(id);
}

async function updateProduto(id) {
    const form = document.getElementById('produto-form');
    const data = Object.fromEntries(new FormData(form));
    const csrftoken = getCookie('csrftoken');
    if (!data.supplier) delete data.supplier;
    try {
        const res = await fetch(API_URL + id + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken, // Adiciona o cabeçalho CSRF
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        hideForm();
        fetchProdutos();
        showMessage('Produto atualizado com sucesso!', 'success');
    } catch {
        showMessage('Erro ao atualizar produto.', 'error');
    }
}

async function deleteProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    showLoading();
    const csrftoken = getCookie('csrftoken');
    try {
        const res = await fetch(API_URL + id + '/', {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken, // Adiciona o cabeçalho CSRF
            },
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        showMessage('Produto excluído com sucesso!', 'success');
        fetchProdutos();
    } catch (err) {
        showMessage('Erro ao excluir produto: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ======= INIT =======
document.addEventListener('DOMContentLoaded', fetchProdutos);