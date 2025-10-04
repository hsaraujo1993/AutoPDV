// precos.js
const API_URL = '/api/v1/prices/';
const API_PRODUCTS_URL = '/api/v1/products/';

// DOM elements
const messagesDiv = document.getElementById('messages');
const formContainer = document.getElementById('form-container');
const tableBody = document.querySelector('#precos-table tbody');

let currentPage = 1;
let hasNextPage = false;
let hasPrevPage = false;

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

// ======= FETCH PREÇOS =======
async function fetchPrecos(page = 1) {
    showLoading();
    try {
        const res = await fetch(`${API_URL}?page=${page}`);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        renderPrecos(data.results);
        currentPage = page;
        hasNextPage = !!data.next;
        hasPrevPage = !!data.previous;
        renderPagination();
    } catch (err) {
        showMessage('Erro ao carregar preços: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

function renderPagination() {
    let pagDiv = document.getElementById('precos-pagination-container');
    if (!pagDiv) {
        // Se a div não existe, cria e insere após a tabela
        const table = document.getElementById('precos-table');
        if (table) {
            pagDiv = document.createElement('div');
            pagDiv.id = 'precos-pagination-container';
            pagDiv.style.display = 'flex';
            pagDiv.style.justifyContent = 'space-between';
            pagDiv.style.alignItems = 'center';
            pagDiv.style.gap = '2rem';
            pagDiv.style.marginTop = '2rem';
            table.parentNode.insertBefore(pagDiv, table.nextSibling);
        }
    }
    if (!pagDiv) return;
    // Botão Adicionar Preço à esquerda
    const addBtn = `<button class="btn create-btn d-flex align-items-center gap-2" type="button" onclick="showForm()">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2" d="M12 5v14m7-7H5"/></svg> Adicionar Preço
    </button>`;
    // Paginação à direita
    let pagBtns = '';
    if (hasPrevPage) {
        pagBtns += `<button class="btn" onclick="fetchPrecos(${currentPage - 1})">Anterior</button>`;
    }
    pagBtns += `<span style="margin:0 1rem;">Página ${currentPage}</span>`;
    if (hasNextPage) {
        pagBtns += `<button class="btn" onclick="fetchPrecos(${currentPage + 1})">Avançar</button>`;
    }
    pagDiv.innerHTML = `<div style='flex:1;'>${addBtn}</div><div style='flex:1; text-align:right;'>${pagBtns}</div>`;
    // Depuração
    console.log('Paginação renderizada');
}

// ======= RENDER =======
function renderPrecos(data) {
    tableBody.innerHTML = '';
    // Renderiza todas as linhas normalmente, sem botão na primeira célula
    for (let i = 0; i < data.length; i++) {
        const p = data[i];
        const id = p.id || p.price_id;
        const produtoBadge = p.product_name ? `<span class='badge'>${p.product_name}</span>` : '-';
        const sku = p.sku ?? '-';
        const oem_code = p.oem_code ?? '-';
        const oem_alternative_code = p.oem_alternative_code ?? '-';
        const purchase_price_without_tax = (p.purchase_price_without_tax != null && p.purchase_price_without_tax !== '') ? `<span class='money'>R$</span> <span class='money-value'>${parseFloat(p.purchase_price_without_tax).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>` : '-';
        const purchase_price_with_tax = (p.purchase_price_with_tax != null && p.purchase_price_with_tax !== '') ? `<span class='money'>R$</span> <span class='money-value'>${parseFloat(p.purchase_price_with_tax).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>` : '-';
        const sale_price = (p.sale_price != null && p.sale_price !== '') ? `<span class='money'>R$</span> <span class='money-value'>${parseFloat(p.sale_price).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>` : '-';
        const profit_margin = (p.profit_margin != null && p.profit_margin !== '') ? `${Math.round(parseFloat(p.profit_margin))}%` : '-';
        tableBody.innerHTML += `
            <tr>
                <td>${produtoBadge}</td>
                <td>${sku}</td>
                <td>${oem_code}</td>
                <td>${oem_alternative_code}</td>
                <td>${purchase_price_without_tax}</td>
                <td>${purchase_price_with_tax}</td>
                <td>${sale_price}</td>
                <td>${profit_margin}</td>
                <td style="text-align:center;">
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-success edit" onclick="editPreco('${id}')" title="Editar Preço">
                            <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M16.5 5.5l2 2a2 2 0 010 2.83l-8.5 8.5a2 2 0 01-1.41.59H5v-3.09a2 2 0 01.59-1.41l8.5-8.5a2 2 0 012.91 0z'/></svg>
                            Editar
                        </button>
                        <button class="btn btn-danger delete" onclick="deletePreco('${id}')" title="Excluir Preço">
                            <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M6 7h12M9 7V5a3 3 0 016 0v2m-7 0h8m-9 2v10a2 2 0 002 2h6a2 2 0 002-2V9'/></svg>
                            Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// ======= FORM FUNCTIONS =======
async function showForm(id = null) {
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <form id="preco-form">
            <select name="product" required></select>
            <input type="number" step="0.01" name="purchase_price_without_tax" placeholder="Compra s/ Imposto" required>
            <input type="number" step="0.01" name="purchase_price_with_tax" placeholder="Compra c/ Imposto" required>
            <input type="number" step="0.01" name="sale_price" placeholder="Venda" required>
            <input type="number" step="0.01" name="profit_margin" placeholder="Margem Lucro" required>
            <button type="submit" class="btn create-btn">Salvar</button>
            <button type="button" class="btn delete" onclick="hideForm()">Cancelar</button>
        </form>
    `;

    // Preenche select de produtos
    try {
        const res = await fetch(API_PRODUCTS_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const products = await res.json();
        const select = formContainer.querySelector('select[name=product]');
        select.innerHTML = products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    } catch {
        showMessage('Erro ao carregar produtos.', 'error');
    }

    const form = document.getElementById('preco-form');

    if (id) {
        populateForm(id);
        form.onsubmit = e => {
            e.preventDefault();
            updatePreco(id);
        };
    } else {
        form.onsubmit = e => {
            e.preventDefault();
            createPreco();
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
        const p = await res.json();
        document.querySelector('select[name=product]').value = p.product;
        document.querySelector('input[name=purchase_price_without_tax]').value = p.purchase_price_without_tax;
        document.querySelector('input[name=purchase_price_with_tax]').value = p.purchase_price_with_tax;
        document.querySelector('input[name=sale_price]').value = p.sale_price;
        document.querySelector('input[name=profit_margin]').value = p.profit_margin;
    } catch {
        showMessage('Erro ao carregar preço.', 'error');
    }
}

// ======= CRUD FUNCTIONS =======
async function createPreco() {
    const form = document.getElementById('preco-form');
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
        fetchPrecos();
        showMessage('Preço cadastrado com sucesso!', 'success');
    } catch {
        showMessage('Erro ao cadastrar preço.', 'error');
    }
}

function editPreco(id) {
    showForm(id);
}

async function updatePreco(id) {
    const form = document.getElementById('preco-form');
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
        fetchPrecos();
        showMessage('Preço atualizado com sucesso!', 'success');
    } catch {
        showMessage('Erro ao atualizar preço.', 'error');
    }
}

async function deletePreco(id) {
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
        fetchPrecos();
        showMessage('Preço excluído!', 'success');
    } catch {
        showMessage('Erro ao excluir preço.', 'error');
    }
}

// ======= INIT =======
document.addEventListener('DOMContentLoaded', () => {
    fetchPrecos();
});
