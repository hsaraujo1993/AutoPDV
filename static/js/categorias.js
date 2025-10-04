// A sua URL da API
const API_URL = '/api/v1/categories/';

// DOM elements
const messagesDiv = document.getElementById('messages');
const formContainer = document.getElementById('form-container');
const tableBody = document.querySelector('#categorias-table tbody');

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

function showMessage(msg, type = 'success', timeout) {
    if (type === 'error') {
        timeout = timeout || 6000;
    } else {
        timeout = timeout || 3000;
    }
    messagesDiv.innerHTML = `<div class="${type}">${msg}</div>`;
    setTimeout(() => {
        if (messagesDiv.innerHTML.includes(msg)) {
            messagesDiv.innerHTML = '';
        }
    }, timeout);
}

function showLoading() {
    messagesDiv.innerHTML = '<div class="loading">Carregando...</div>';
}

function hideLoading() {
    messagesDiv.innerHTML = '';
}

// ======= FETCH CATEGORIAS =======
async function fetchCategorias() {
    showLoading();
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        renderCategorias(data.results); // Corrigido para passar apenas o array
    } catch (err) {
        showMessage('Erro ao carregar categorias: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ======= RENDER =======
function renderCategorias(data) {
    tableBody.innerHTML = '';
    data.forEach(c => {
        const id = c.category_id || c.id;
        const nomeBadge = c.name ? `<span class='badge bg-primary text-light'>${c.name}</span>` : '-';
        tableBody.innerHTML += `
            <tr>
                <td>${nomeBadge}</td>
                <td>${c.description ? c.description : '-'}</td>
                <td class="text-center">
                    <button class="btn btn-success edit me-2" onclick="editCategoria('${id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Editar Categoria">
                        <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M16.5 5.5l2 2a2 2 0 010 2.83l-8.5 8.5a2 2 0 01-1.41.59H5v-3.09a2 2 0 01.59-1.41l8.5-8.5a2 2 0 012.91 0z'/></svg>
                        Editar
                    </button>
                    <button class="btn btn-danger delete" onclick="deleteCategoria('${id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Excluir Categoria">
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
}

// ======= FORM FUNCTIONS =======
function showForm(id = null) {
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <form id="categoria-form">
            <input type="text" name="name" placeholder="Nome" required>
            <input type="text" name="description" placeholder="Descrição">
            <button type="submit" class="btn create-btn">Salvar</button>
            <button type="button" class="btn delete" onclick="hideForm()">Cancelar</button>
        </form>
    `;

    const form = document.getElementById('categoria-form');

    if (id) {
        populateForm(id);
        form.onsubmit = e => {
            e.preventDefault();
            updateCategoria(id);
        };
    } else {
        form.onsubmit = e => {
            e.preventDefault();
            createCategoria();
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
        const c = await res.json();
        document.querySelector('input[name=name]').value = c.name;
        document.querySelector('input[name=description]').value = c.description;
    } catch {
        showMessage('Erro ao carregar categoria.', 'error');
    }
}

// ======= CRUD FUNCTIONS =======
async function createCategoria() {
    const form = document.getElementById('categoria-form');
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
        fetchCategorias();
        showMessage('Categoria cadastrada com sucesso!', 'success');
    } catch {
        showMessage('Erro ao cadastrar categoria.', 'error');
    }
}

function editCategoria(id) {
    showForm(id);
}

async function updateCategoria(id) {
    const form = document.getElementById('categoria-form');
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
        fetchCategorias();
        showMessage('Categoria atualizada com sucesso!', 'success');
    } catch {
        showMessage('Erro ao atualizar categoria.', 'error');
    }
}

async function deleteCategoria(id) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    showLoading();
    const csrftoken = getCookie('csrftoken');
    try {
        const res = await fetch(API_URL + id + '/', { 
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken,
            },
        });
        if (!res.ok) {
            const errorData = await res.json();
            const msg = errorData.detail || `Erro ${res.status}`;
            throw new Error(msg);
        }
        showMessage('Categoria excluída com sucesso!', 'success');
        fetchCategorias();
    } catch (err) {
        showMessage('Erro ao excluir categoria: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ======= INIT =======
document.addEventListener('DOMContentLoaded', fetchCategorias);