// URLs da API
const API_CART_URL = '/api/v1/carts/';
const API_CARTITEM_URL = '/api/v1/cart-items/';
const API_PRODUCTS_URL = '/api/v1/products/';
const API_CUSTOMERS_URL = '/api/v1/customers/';

// Não precisamos mais de currentCartId, pois iremos redirecionar
// let currentCartId = null;

// DOM elements
const cartItemsContainer = document.getElementById('cart-items-container');
const formContainer = document.getElementById('form-container');
const messagesDiv = document.getElementById('messages');
const cartTableBody = document.querySelector('#cart-table tbody');

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

// ======= FETCH CARRINHOS (para a página de lista) =======
async function fetchCarts() {
    showLoading();
    try {
        const res = await fetch(API_CART_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const carts = await res.json();
        renderCarts(carts);
    } catch {
        showMessage('Erro ao carregar carrinhos.', 'error');
    } finally {
        hideLoading();
    }
}

// ======= RENDER (para a página de lista) =======
function renderCarts(carts) {
    if (!cartTableBody) return;
    cartTableBody.innerHTML = '';
    if (!carts.length) {
        cartTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum carrinho encontrado.</td></tr>';
        return;
    }
    carts.forEach(cart => {
        cartTableBody.innerHTML += `
            <tr>
                <td>${cart.status_cart ? cart.status_cart : '-'}</td>
                <td>${cart.created_at ? new Date(cart.created_at).toLocaleString() : '-'}</td>
                <td>${cart.updated_at ? new Date(cart.updated_at).toLocaleString() : '-'}</td>
                <td>${cart.customer_name ? cart.customer_name : '-'}</td>
                <td class="text-center">
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-primary" title="Abrir Carrinho" onclick="openCart('${cart.id}')">
                            Abrir
                        </button>
                        <button class="btn btn-danger" title="Excluir Carrinho" onclick="deleteCart('${cart.id}')">
                            Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// Função para redirecionar para página de itens do carrinho
function openCart(cartId) {
    window.location.href = `/carrinho/itens/${cartId}/`;
}

// ======= NOVAS FUNÇÕES DE REDIRECIONAMENTO =======
async function createCartWithCustomer(e) {
    e.preventDefault();
    const form = document.getElementById('cart-form');
    const data = Object.fromEntries(new FormData(form));
    const csrftoken = getCookie('csrftoken');
    try {
        const res = await fetch(API_CART_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({ customer: data.customer })
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const cart = await res.json();
        showMessage('Carrinho criado! Redirecionando...', 'success');
        // Redireciona para a página de detalhes
        window.location.href = `/carrinho/itens/${cart.id}/`;
    } catch {
        showMessage('Erro ao criar carrinho.', 'error');
    }
}

async function deleteCart(cartId) {
    const csrftoken = getCookie('csrftoken');
    if (!cartId) return;
    try {
        const res = await fetch(`${API_CART_URL}${cartId}/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': csrftoken },
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        showMessage('Carrinho excluído!', 'success');
        fetchCarts();
    } catch (err) {
        showMessage('Erro ao excluir carrinho.', 'error');
    }
}

async function showCartForm() {
    formContainer.style.display = 'block';
    formContainer.innerHTML = `
        <form id="cart-form">
            <select name="customer" required></select>
            <div class="d-flex gap-2 mt-2">
                <button type="submit" class="btn btn-success">Criar Carrinho</button>
                <button type="button" class="btn btn-secondary" onclick="hideForm()">Cancelar</button>
            </div>
        </form>
    `;
    try {
        const res = await fetch(API_CUSTOMERS_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const customers = await res.json();
        const select = formContainer.querySelector('select[name=customer]');
        select.innerHTML = customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch {
        showMessage('Erro ao carregar clientes.', 'error');
    }
    document.getElementById('cart-form').onsubmit = createCartWithCustomer;
}

function hideForm() {
    formContainer.style.display = 'none';
    formContainer.innerHTML = '';
}


document.addEventListener('DOMContentLoaded', fetchCarts);