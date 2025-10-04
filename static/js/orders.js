// orders.js
const API_URL = '/api/v1/orders/';

// DOM elements
const messagesDiv = document.getElementById('messages');
const tableBody = document.querySelector('#orders-table tbody');
const novoPedidoBtn = document.getElementById('novo-pedido-btn');

// ======= UTILIDADES =======
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

// ======= PAGINAÇÃO =======
let currentPage = 1;
let hasNextPage = false;
let hasPrevPage = false;

// ======= FETCH ORDERS =======
async function fetchOrders(page = 1) {
    showLoading();
    try {
        const res = await fetch(`${API_URL}?page=${page}`);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        renderOrders(data.results);
        currentPage = page;
        hasNextPage = !!data.next;
        hasPrevPage = !!data.previous;
        renderPagination();
    } catch (err) {
        showMessage('Erro ao carregar pedidos: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ======= RENDER =======
function renderOrders(data) {
    tableBody.innerHTML = '';
    if (!Array.isArray(data) || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Nenhum pedido encontrado.</td></tr>`;
        return;
    }

    data.forEach(o => {
        const salesOrder = o.sales_order ? o.sales_order : '-';
        const customerName = o.customer && o.customer.name ? o.customer.name : '-';
        const status = o.order_status ? o.order_status : '-';
        const date = o.created_at ? new Date(o.created_at).toLocaleString() : '-';
        const total = o.total_amount != null ? `R$ ${parseFloat(o.total_amount).toFixed(2)}` : '-';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${salesOrder}</td>
            <td>${customerName}</td>
            <td>${date}</td>
            <td>${status}</td>
            <td>${total}</td>
            <td style="text-align:center;">
                <button class="btn btn-info view" onclick="viewOrder('${o.id}')" title="Visualizar Pedido">
                    <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z'/><circle cx='12' cy='12' r='3' stroke='currentColor' stroke-width='2'/></svg>
                    Visualizar
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function renderPagination() {
    let pagDiv = document.getElementById('orders-pagination');
    if (!pagDiv) {
        pagDiv = document.createElement('div');
        pagDiv.id = 'orders-pagination';
        pagDiv.className = 'd-flex justify-content-center gap-2 my-3';
        tableBody.parentElement.appendChild(pagDiv);
    }
    pagDiv.innerHTML = `
        <button class="btn" onclick="fetchOrders(${currentPage - 1})" ${hasPrevPage ? '' : 'disabled'}>Anterior</button>
        <span>Página ${currentPage}</span>
        <button class="btn" onclick="fetchOrders(${currentPage + 1})" ${hasNextPage ? '' : 'disabled'}>Avançar</button>
    `;
}

// ======= CRUD FUNCTIONS =======
function viewOrder(id) {
    window.location.href = `/orders/${id}/detail/`;
}

// ======= INIT =======
document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});
