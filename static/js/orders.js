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

// ======= FETCH ORDERS =======
async function fetchOrders() {
    showLoading();
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        renderOrders(data);
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
        const id = o.id ? o.id : '-';
        const customerName = o.customer && o.customer.name ? o.customer.name : '-';
        const status = o.order_status ? o.order_status : '-';
        const date = o.created_at ? new Date(o.created_at).toLocaleString() : '-';
        const total = o.total_amount != null ? `R$ ${parseFloat(o.total_amount).toFixed(2)}` : '-';
        const itemsHtml = o.items && o.items.length
            ? '<div class="order-items-badges">' + o.items.map(i => `<span class="badge">${i.product_name ? i.product_name : '-'} <span class="qty">x${i.quantity != null ? i.quantity : '-'}</span></span>`).join(' ') + '</div>'
            : '-';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${id}</td>
            <td>${customerName}</td>
            <td>${status}</td>
            <td>${date}</td>
            <td>${total}</td>
            <td>${itemsHtml}</td>
            <td style="text-align:center;">
                <button class="btn btn-primary edit" onclick="editOrder('${id}')" title="Editar Pedido">
                    <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M16.5 5.5l2 2a2 2 0 010 2.83l-8.5 8.5a2 2 0 01-1.41.59H5v-3.09a2 2 0 01.59-1.41l8.5-8.5a2 2 0 012.91 0z'/></svg>
                    Editar
                </button>
                <button class="btn btn-danger delete" onclick="deleteOrder('${id}')" title="Excluir Pedido">
                    <svg width='16' height='16' fill='none' viewBox='0 0 24 24' style='vertical-align:middle;margin-right:2px;'><path stroke='currentColor' stroke-width='2' d='M6 7h12M9 7V5a3 3 0 016 0v2m-7 0h8m-9 2v10a2 2 0 002 2h6a2 2 0 002-2V9'/></svg>
                    Excluir
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ======= CRUD FUNCTIONS =======
function editOrder(id) {
    // A função showForm() deve ser implementada para exibir um formulário de edição
    showMessage(`Função de edição do pedido ${id} não implementada.`, 'info');
}

function deleteOrder(id) {
    // A função deleteOrder() deve ser implementada para excluir o pedido da API
    showMessage(`Função de exclusão do pedido ${id} não implementada.`, 'info');
}

function showForm() {
    // A função showForm() deve ser implementada para exibir o formulário de criação de pedido
    showMessage("Função 'Novo Pedido' não implementada.", 'info');
}

// ======= INIT =======
document.addEventListener('DOMContentLoaded', fetchOrders);