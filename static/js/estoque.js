// produtos.js
const API_URL = '/api/v1/stocks/';
const API_PRODUCTS_URL = '/api/v1/products/';

// DOM elements
const messagesDiv = document.getElementById('messages');
const formContainer = document.getElementById('form-container');
const tableBody = document.querySelector('#estoque-table tbody');

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

// ======= FETCH ESTOQUE =======
async function fetchEstoque() {
    showLoading();
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        renderEstoque(data);
    } catch (err) {
        showMessage('Erro ao carregar estoque: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ======= RENDER =======
function renderEstoque(data) {
    tableBody.innerHTML = '';
    data.forEach(e => {
        const id = e.stock_id || e.id;
        const produtoBadge = e.product_name ? `<span class='badge bg-primary'>${e.product_name}</span>` : '-';
        tableBody.innerHTML += `
            <tr class="fade-in">
                <td>${produtoBadge}</td>
                <td>${e.quantity != null ? e.quantity : '-'}</td>
                <td>${e.location ? e.location : '-'}</td>
                <td class="text-center">
                    <button class="btn btn-success edit me-2" onclick="editEstoque('${id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Editar Estoque">
                        <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M16.5 5.5l2 2a2 2 0 010 2.83l-8.5 8.5a2 2 0 01-1.41.59H5v-3.09a2 2 0 01.59-1.41l8.5-8.5a2 2 0 012.91 0z'/></svg>
                        Editar
                    </button>
                    <button class="btn btn-danger delete" onclick="deleteEstoque('${id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Excluir Estoque">
                        <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M6 7h12M9 7V5a3 3 0 016 0v2m-7 0h8m-9 2v10a2 2 0 002 2h6a2 2 0 002-2V9'/></svg>
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
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
document.addEventListener('DOMContentLoaded', fetchEstoque);