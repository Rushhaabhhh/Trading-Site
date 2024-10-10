from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Trade, ZerodhaCredentials

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Account created successfully. You can now log in.')
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'trading/register.html', {'form': form})

@login_required
def dashboard(request):
    try:
        zerodha_account = ZerodhaCredentials.objects.get(user=request.user)
        is_connected = True
    except ZerodhaCredentials.DoesNotExist:
        is_connected = False
    
    recent_trades = Trade.objects.filter(user=request.user).order_by('-timestamp')[:5]
    
    context = {
        'is_connected': is_connected,
        'recent_trades': recent_trades,
    }
    return render(request, 'trading/dashboard.html', context)

@login_required
def trade_history(request):
    trades = Trade.objects.filter(user=request.user).order_by('-timestamp')
    return render(request, 'trading/trade_history.html', {'trades': trades})