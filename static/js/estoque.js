// URLs da API
const API_URL = '/api/v1/stocks/';
const API_PRODUCTS_URL = '/api/v1/products/';

// DOM elements
const messagesDiv = document.getElementById('messages');
const formContainer = document.getElementById('form-container');
const tableBody = document.querySelector('#estoque-table tbody');

// Caches de dados
const productsCache = {};

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

// ======= FETCH DATA =======
async function fetchProducts() {
    try {
        const res = await fetch(API_PRODUCTS_URL);
        const data = await res.json();
        data.forEach(p => (productsCache[p.id] = p));
    } catch (err) {
        console.error('Erro ao carregar produtos', err);
    }
}

let currentPage = 1;
let hasNextPage = false;
let hasPrevPage = false;

async function fetchEstoque(page = 1) {
    showLoading();
    try {
        const res = await fetch(`${API_URL}?page=${page}`);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        renderEstoque(data.results);
        currentPage = page;
        hasNextPage = !!data.next;
        hasPrevPage = !!data.previous;
        renderPagination();
    } catch (err) {
        showMessage('Erro ao carregar estoque: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

function renderPagination() {
    let pagDiv = document.getElementById('estoque-pagination');
    if (!pagDiv) {
        pagDiv = document.createElement('div');
        pagDiv.id = 'estoque-pagination';
        pagDiv.className = 'd-flex justify-content-center gap-2 my-3';
        tableBody.parentElement.appendChild(pagDiv);
    }
    pagDiv.innerHTML = `
        <button class="btn" onclick="fetchEstoque(${currentPage - 1})" ${hasPrevPage ? '' : 'disabled'}>Anterior</button>
        <span>Página ${currentPage}</span>
        <button class="btn" onclick="fetchEstoque(${currentPage + 1})" ${hasNextPage ? '' : 'disabled'}>Avançar</button>
    `;
}

async function init() {
    await fetchProducts();
    fetchEstoque();
}

// ======= RENDER =======
function renderEstoque(data) {
    tableBody.innerHTML = '';
    data.forEach(item => {
        const id = item.id;
        const produto = productsCache[item.product] || { name: 'Produto não encontrado' };
        tableBody.innerHTML += `
            <tr class="fade-in">
                <td><span class='badge bg-primary'>${produto.name || '-'}</span></td>
                <td>${produto.sku || '-'}</td>
                <td>${produto.oem_code || '-'}</td>
                <td>${produto.oem_alternative_code || '-'}</td>
                <td>${item.quantity != null ? item.quantity : '-'}</td>
                <td>${item.location ? item.location : '-'}</td>
                <td class="text-center">
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-success edit" onclick="editEstoque('${id}')" data-bs-toggle="tooltip" title="Editar Estoque">
                            Alterar
                        </button>
                        <button class="btn btn-danger delete" onclick="deleteEstoque('${id}')" data-bs-toggle="tooltip" title="Excluir Estoque">
                            Deletar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
    if (!document.getElementById('fade-in-style')) {
        const style = document.createElement('style');
        style.id = 'fade-in-style';
        style.innerHTML = `.fade-in { animation: fadeIn 0.7s ease; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;
        document.head.appendChild(style);
    }
}

// ======= FORM FUNCTIONS =======
async function showForm(id = null) {
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <form id="estoque-form">
            <select name="product" required></select>
            <input type="number" name="quantity" placeholder="Quantidade" required min="0">
            <input type="number" name="min_quantity" placeholder="Quantidade Mínima" required min="0">
            <input type="number" name="max_quantity" placeholder="Quantidade Máxima" required min="0">
            <input type="text" name="location" placeholder="Localização" required>
            <button type="submit" class="btn create-btn">Salvar</button>
            <button type="button" class="btn delete" onclick="hideForm()">Cancelar</button>
        </form>
    `;

    try {
        const res = await fetch(API_PRODUCTS_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const prods = await res.json();
        const select = formContainer.querySelector('select[name=product]');
        select.innerHTML = prods.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    } catch {
        showMessage('Erro ao carregar produtos.', 'error');
    }

    const form = document.getElementById('estoque-form');

    if (id) {
        populateForm(id);
        form.onsubmit = e => {
            e.preventDefault();
            updateEstoque(id);
        };
    } else {
        form.onsubmit = e => {
            e.preventDefault();
            createEstoque();
        };
    }
}

function hideForm() {
    formContainer.style.display = 'none';
    formContainer.innerHTML = '';
}

async function populateForm(id) {
    try {
        const res = await fetch(API_URL + id + '/');
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const e = await res.json();
        document.querySelector('select[name=product]').value = e.product;
        document.querySelector('input[name=quantity]').value = e.quantity;
        document.querySelector('input[name=min_quantity]').value = e.min_quantity;
        document.querySelector('input[name=max_quantity]').value = e.max_quantity;
        document.querySelector('input[name=location]').value = e.location;
    } catch {
        showMessage('Erro ao carregar estoque.', 'error');
    }
}

// ======= CRUD FUNCTIONS =======
async function createEstoque() {
    const form = document.getElementById('estoque-form');
    const data = Object.fromEntries(new FormData(form));
    const csrftoken = getCookie('csrftoken');

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        hideForm();
        fetchEstoque();
        showMessage('Estoque cadastrado com sucesso!', 'success');
    } catch {
        showMessage('Erro ao cadastrar estoque.', 'error');
    }
}

function editEstoque(id) {
    showForm(id);
}

async function updateEstoque(id) {
    const form = document.getElementById('estoque-form');
    const data = Object.fromEntries(new FormData(form));
    const csrftoken = getCookie('csrftoken');

    try {
        const res = await fetch(API_URL + id + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        hideForm();
        fetchEstoque();
        showMessage('Estoque atualizado com sucesso!', 'success');
    } catch {
        showMessage('Erro ao atualizar estoque.', 'error');
    }
}

async function deleteEstoque(id) {
    if (!confirm('Deseja realmente excluir?')) return;
    const csrftoken = getCookie('csrftoken');

    try {
        const res = await fetch(API_URL + id + '/', {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken,
            },
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        fetchEstoque();
        showMessage('Estoque excluído!', 'success');
    } catch {
        showMessage('Erro ao excluir estoque.', 'error');
    }
}

// ======= INIT =======
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    fetchEstoque();
});
