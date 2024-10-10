from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from trading import views as trading_views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication URLs
    path('login/', auth_views.LoginView.as_view(template_name='trading/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('register/', trading_views.register, name='register'),
    
    # Trading app URLs
    path('', trading_views.dashboard, name='dashboard'),
    path('connect-zerodha/', trading_views.connect_zerodha, name='connect_zerodha'),
    path('place-order/', trading_views.place_order, name='place_order'),
    path('trades/', trading_views.trade_history, name='trade_history'),
]