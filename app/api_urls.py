from django.urls import path, include

urlpatterns = [
    path('carts/', include('carts.urls')),
    path('orders/', include('orders.urls')),
    path('products/', include('products.urls')),
    path('categories/', include('categories.urls')),
    path('prices/', include('prices.urls')),
    path('suppliers/', include('suppliers.urls')),
    path('order_items/', include('order_items.urls')),
    path('cart_items/', include('cart_items.urls')),
    path('stocks/', include('stocks.urls')),
    path('customers/', include('customers.urls')),
    path('cart-items/', include('cart_items.urls')),
]