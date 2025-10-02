// A sua URL da API
const API_URL = '/api/v1/suppliers/';

// DOM elements
const messagesDiv = document.getElementById('messages');
const formContainer = document.getElementById('form-container');
const tableBody = document.querySelector('#fornecedores-table tbody');

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

// ======= FETCH FORNECEDORES =======
async function fetchFornecedores() {
    showLoading();
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        renderFornecedores(data);
    } catch (err) {
        showMessage('Erro ao carregar fornecedores: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ======= RENDER =======
function renderFornecedores(data) {
    tableBody.innerHTML = '';
    data.forEach(f => {
        const id = f.supplier_id || f.id;
        tableBody.innerHTML += `
            <tr>
                <td>${f.name ? f.name : '-'}</td>
                <td>${f.contact_email ? f.contact_email : '-'}</td>
                <td>${f.phone_number ? f.phone_number : '-'}</td>
                <td>${f.address ? f.address : '-'}</td>
                <td>${f.cnpj ? f.cnpj : '-'}</td>
                <td class="text-center">
                    <button class="btn btn-success edit me-2" onclick="editFornecedor('${id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Editar Fornecedor">
                        <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M16.5 5.5l2 2a2 2 0 010 2.83l-8.5 8.5a2 2 0 01-1.41.59H5v-3.09a2 2 0 01.59-1.41l8.5-8.5a2 2 0 012.91 0z'/></svg>
                        Editar
                    </button>
                    <button class="btn btn-danger delete" onclick="deleteFornecedor('${id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Excluir Fornecedor">
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
function showForm(id = null) {
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <form id="fornecedor-form">
            <input type="text" name="name" placeholder="Nome" required>
            <input type="email" name="email" placeholder="Email" required>
            <input type="text" name="phone" placeholder="Telefone" required>
            <input type="text" name="address" placeholder="Endereço">
            <input type="text" name="cnpj" placeholder="CNPJ">
            <button type="submit" class="btn create-btn">Salvar</button>
            <button type="button" class="btn delete" onclick="hideForm()">Cancelar</button>
        </form>
    `;

    const form = document.getElementById('fornecedor-form');

    if (id) {
        populateForm(id);
        form.onsubmit = e => {
            e.preventDefault();
            updateFornecedor(id);
        };
    } else {
        form.onsubmit = e => {
            e.preventDefault();
            createFornecedor();
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
        const f = await res.json();
        document.querySelector('input[name=name]').value = f.name;
        document.querySelector('input[name=email]').value = f.email || f.contact_email || '';
        document.querySelector('input[name=phone]').value = f.phone || f.phone_number || '';
        document.querySelector('input[name=address]').value = f.address || '';
        document.querySelector('input[name=cnpj]').value = f.cnpj || '';
    } catch {
        showMessage('Erro ao carregar fornecedor.', 'error');
    }
}

// ======= CRUD FUNCTIONS =======
async function createFornecedor() {
    const form = document.getElementById('fornecedor-form');
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        contact_email: formData.get('email'),
        phone_number: formData.get('phone'),
        address: formData.get('address'),
        cnpj: formData.get('cnpj'),
    };
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
        fetchFornecedores();
        showMessage('Fornecedor cadastrado com sucesso!', 'success');
    } catch {
        showMessage('Erro ao cadastrar fornecedor.', 'error');
    }
}

function editFornecedor(id) {
    showForm(id);
}

async function updateFornecedor(id) {
    const form = document.getElementById('fornecedor-form');
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        contact_email: formData.get('email'),
        phone_number: formData.get('phone'),
        address: formData.get('address'),
        cnpj: formData.get('cnpj'),
    };
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
        fetchFornecedores();
        showMessage('Fornecedor atualizado com sucesso!', 'success');
    } catch {
        showMessage('Erro ao atualizar fornecedor.', 'error');
    }
}

async function deleteFornecedor(id) {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;
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
        showMessage('Fornecedor excluído com sucesso!', 'success');
        fetchFornecedores();
    } catch (err) {
        showMessage('Erro ao excluir fornecedor: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ======= INIT =======
document.addEventListener('DOMContentLoaded', fetchFornecedores);