// A sua URL da API
const API_URL = '/api/v1/customers/';

// DOM elements
const messagesDiv = document.getElementById('messages');
const formContainer = document.getElementById('form-container');
const tableBody = document.querySelector('#clientes-table tbody');

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

// ======= FETCH CLIENTES =======
async function fetchClientes() {
    showLoading();
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        renderClientes(data);
    } catch (err) {
        showMessage('Erro ao carregar clientes: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ======= RENDER =======
function renderClientes(data) {
    tableBody.innerHTML = '';
    data.forEach(c => {
        const id = c.customer_id || c.id;
        tableBody.innerHTML += `
            <tr class="fade-in">
                <td>${c.name ? c.name : '-'}</td>
                <td>${c.email ? c.email : '-'}</td>
                <td>${c.phone ? c.phone : '-'}</td>
                <td>${c.address ? c.address : '-'}</td>
                <td>${c.type ? c.type : '-'}</td>
                <td class="text-center">
                    <button class="btn btn-primary edit me-2" onclick="editCliente('${id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Editar Cliente">
                        Editar
                    </button>
                    <button class="btn btn-danger delete" onclick="deleteCliente('${id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Excluir Cliente">
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
    // Adiciona animação fade-in via CSS
    if (!document.getElementById('fade-in-style')) {
        const style = document.createElement('style');
        style.id = 'fade-in-style';
        style.innerHTML = `.fade-in { animation: fadeIn 0.7s ease; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;
        document.head.appendChild(style);
    }
}

// ======= FORM FUNCTIONS =======
function showForm(id = null) {
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <form id="cliente-form">
            <input type="text" name="name" placeholder="Nome" required>
            <input type="email" name="email" placeholder="Email">
            <input type="text" name="phone" placeholder="Telefone">
            <input type="text" name="address" placeholder="Endereço">
            <select name="type" required>
                <option value="">-- Selecione o Tipo --</option>
                <option value="mecanico">Mecânico</option>
                <option value="varejo">Varejo</option>
                <option value="cliente_final">Cliente Final</option>
                <option value="cliente_vip">Cliente VIP</option>
            </select>
            <button type="submit" class="btn create-btn">Salvar</button>
            <button type="button" class="btn delete" onclick="hideForm()">Cancelar</button>
        </form>
    `;

    const form = document.getElementById('cliente-form');

    if (id) {
        populateForm(id);
        form.onsubmit = e => {
            e.preventDefault();
            updateCliente(id);
        };
    } else {
        form.onsubmit = e => {
            e.preventDefault();
            createCliente();
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
        document.querySelector('input[name=email]').value = c.email;
        document.querySelector('input[name=phone]').value = c.phone;
        document.querySelector('input[name=address]').value = c.address;
        document.querySelector('select[name=type]').value = c.type;
    } catch {
        showMessage('Erro ao carregar cliente.', 'error');
    }
}

// ======= CRUD FUNCTIONS =======
async function createCliente() {
    const form = document.getElementById('cliente-form');
    const data = Object.fromEntries(new FormData(form));

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        hideForm();
        fetchClientes();
        showMessage('Cliente cadastrado com sucesso!', 'success');
    } catch {
        showMessage('Erro ao cadastrar cliente.', 'error');
    }
}

function editCliente(id) {
    showForm(id);
}

async function updateCliente(id) {
    const form = document.getElementById('cliente-form');
    const data = Object.fromEntries(new FormData(form));

    try {
        const res = await fetch(API_URL + id + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        hideForm();
        fetchClientes();
        showMessage('Cliente atualizado com sucesso!', 'success');
    } catch {
        showMessage('Erro ao atualizar cliente.', 'error');
    }
}

async function deleteCliente(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    showLoading();
    try {
        const res = await fetch(API_URL + id + '/', {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        showMessage('Cliente excluído com sucesso!', 'success');
        fetchClientes();
    } catch (err) {
        showMessage('Erro ao excluir cliente: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ======= INIT =======
document.addEventListener('DOMContentLoaded', fetchClientes);