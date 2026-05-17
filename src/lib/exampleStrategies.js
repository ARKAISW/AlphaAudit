/**
 * Pre-loaded example strategies for AlphaAudit demo.
 * Each is deliberately broken to showcase specific bias detection.
 */

export const EXAMPLE_STRATEGIES = [
  {
    id: 'overfit_momentum',
    name: 'The Overfit Momentum Strategy',
    description: 'Look-ahead bias, 7 optimized parameters, no OOS test, no transaction costs',
    expectedScore: 23,
    code: `import numpy as np
import pandas as pd

# =============================================================
# Momentum Strategy with Optimized Parameters
# "This strategy returned 45% annually with a Sharpe of 2.8!"
# =============================================================

def run_strategy(df):
    """
    Multi-factor momentum strategy with parameter optimization.
    Data: daily OHLCV for a single equity.
    """
    
    # --- Feature Engineering ---
    # BUG: Using tomorrow's close to generate today's signal (look-ahead bias!)
    df['signal'] = df['close'].shift(-1) - df['close']
    
    # BUG: Future returns used in feature construction
    df['future_return'] = df['close'].pct_change().shift(-1)
    df['momentum_score'] = df['future_return'].rolling(window=10).mean()
    
    # --- Parameter Optimization (7 free parameters, no walk-forward) ---
    fast_ma = 12    # optimized from range(5, 50)
    slow_ma = 48    # optimized from range(20, 200)
    rsi_period = 14  # optimized from range(7, 21)
    rsi_upper = 72   # optimized from range(65, 85)
    rsi_lower = 31   # optimized from range(15, 35)
    vol_lookback = 18  # optimized from range(10, 30)
    signal_threshold = 0.023  # optimized from np.arange(0.01, 0.05, 0.005)
    
    # --- Indicators ---
    df['fast_ma'] = df['close'].rolling(window=fast_ma).mean()
    df['slow_ma'] = df['close'].rolling(window=slow_ma).mean()
    
    # RSI calculation
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=rsi_period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=rsi_period).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))
    
    # Volatility
    df['volatility'] = df['close'].pct_change().rolling(window=vol_lookback).std()
    
    # --- Signal Generation ---
    df['position'] = 0
    long_condition = (
        (df['fast_ma'] > df['slow_ma']) &
        (df['rsi'] < rsi_upper) &
        (df['rsi'] > rsi_lower) &
        (df['momentum_score'] > signal_threshold)
    )
    df.loc[long_condition, 'position'] = 1
    
    # --- P&L Calculation (no transaction costs!) ---
    df['returns'] = df['close'].pct_change()
    df['strategy_returns'] = df['position'].shift(1) * df['returns']
    
    # --- Performance Metrics ---
    total_return = (1 + df['strategy_returns']).prod() - 1
    
    # BUG: Sharpe calculated without risk-free rate
    sharpe = df['strategy_returns'].mean() / df['strategy_returns'].std() * np.sqrt(252)
    
    print(f"Total Return: {total_return:.2%}")
    print(f"Sharpe Ratio: {sharpe:.2f}")
    
    return df
`,
  },
  {
    id: 'survivor_bias',
    name: "The Survivor's Bias Trap",
    description: "Today's S&P 500 tickers for 2010-2020 backtest, fixed sizing, wrong Sharpe",
    expectedScore: 38,
    code: `import numpy as np
import pandas as pd

# =============================================================
# Equal-Weight S&P 500 Mean Reversion Strategy
# "Beats the market by 12% annually since 2010!"
# =============================================================

def get_sp500_components():
    """Get current S&P 500 tickers."""
    # BUG: This returns TODAY's S&P 500 members
    # Companies that went bankrupt between 2010-2020 are excluded
    # (e.g., Lehman Brothers, Kodak, RadioShack, Toys R Us)
    return [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA',
        'BRK-B', 'JPM', 'V', 'UNH', 'MA', 'HD', 'PG', 'JNJ',
        'ABBV', 'XOM', 'BAC', 'COST', 'KO',
        # ... remaining ~480 tickers (all survivors)
    ]

def run_strategy(price_data):
    """
    Mean reversion: buy stocks that dropped >2 std devs,
    sell stocks that rose >2 std devs.
    """
    tickers = get_sp500_components()  # Survivorship bias here!
    
    portfolio_returns = []
    
    for ticker in tickers:
        if ticker not in price_data:
            continue
            
        df = price_data[ticker].copy()
        df['returns'] = df['close'].pct_change()
        df['z_score'] = (
            (df['returns'] - df['returns'].rolling(60).mean()) /
            df['returns'].rolling(60).std()
        )
        
        # Mean reversion signal
        df['position'] = 0
        df.loc[df['z_score'] < -2, 'position'] = 1   # Buy oversold
        df.loc[df['z_score'] > 2, 'position'] = -1    # Sell overbought
        
        # BUG: Fixed position sizing — always 100 shares regardless of price
        shares = 100
        df['pnl'] = shares * df['position'].shift(1) * df['close'].diff()
        
        portfolio_returns.append(df['pnl'])
    
    total_pnl = pd.concat(portfolio_returns, axis=1).sum(axis=1)
    
    # BUG: No transaction costs deducted
    # BUG: Sharpe without risk-free rate, assumes daily frequency
    daily_returns = total_pnl / 1000000  # Assume $1M portfolio
    sharpe = daily_returns.mean() / daily_returns.std() * np.sqrt(252)
    
    annual_return = daily_returns.mean() * 252
    print(f"Annual Return: {annual_return:.2%}")
    print(f"Sharpe Ratio: {sharpe:.2f}")
    
    return total_pnl
`,
  },
  {
    id: 'almost_good',
    name: 'The Almost-Good Strategy',
    description: 'Mostly clean code with one subtle look-ahead bias and missing slippage',
    expectedScore: 72,
    code: `import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

# =============================================================
# Trend-Following Strategy with Volatility Targeting
# A well-structured strategy with a subtle data leakage bug.
# =============================================================

def run_strategy(df, risk_free_rate=0.05):
    """
    Trend-following with volatility targeting.
    Uses 50/200 day moving average crossover with vol scaling.
    """
    
    # --- Data Validation ---
    required_cols = ['open', 'high', 'low', 'close', 'volume']
    assert all(col in df.columns for col in required_cols), "Missing columns"
    df = df.dropna(subset=required_cols).copy()
    
    # --- Feature Engineering ---
    df['returns'] = df['close'].pct_change()
    df['ma_50'] = df['close'].rolling(50).mean()
    df['ma_200'] = df['close'].rolling(200).mean()
    df['atr'] = compute_atr(df, period=14)
    
    # BUG (subtle): Fitting scaler on ENTIRE dataset before splitting
    # This leaks future distribution information into historical signals
    scaler = StandardScaler()
    df['volume_z'] = scaler.fit_transform(df[['volume']])
    
    # --- Signal Generation ---
    df['trend'] = np.where(df['ma_50'] > df['ma_200'], 1, -1)
    df['signal'] = df['trend']
    
    # Filter: only trade when volume is above average
    df.loc[df['volume_z'] < 0, 'signal'] = 0
    
    # --- Volatility-Targeted Position Sizing ---
    target_vol = 0.15  # 15% annual vol target
    realized_vol = df['returns'].rolling(20).std() * np.sqrt(252)
    df['position_size'] = target_vol / realized_vol.clip(lower=0.05)
    df['position_size'] = df['position_size'].clip(upper=2.0)  # Max 2x leverage
    
    # --- P&L Calculation ---
    df['strategy_returns'] = (
        df['signal'].shift(1) * 
        df['position_size'].shift(1) * 
        df['returns']
    )
    
    # Transaction costs: commissions only, NO slippage model
    df['trades'] = df['signal'].diff().abs()
    commission_per_trade = 0.001  # 10 bps
    df['costs'] = df['trades'] * commission_per_trade
    df['net_returns'] = df['strategy_returns'] - df['costs']
    
    # --- Performance (correctly annualized with risk-free rate) ---
    annual_return = df['net_returns'].mean() * 252
    annual_vol = df['net_returns'].std() * np.sqrt(252)
    sharpe = (annual_return - risk_free_rate) / annual_vol
    
    # --- Out-of-Sample Split ---
    split_idx = int(len(df) * 0.7)
    is_returns = df['net_returns'].iloc[:split_idx]
    oos_returns = df['net_returns'].iloc[split_idx:]
    
    is_sharpe = (is_returns.mean() * 252 - risk_free_rate) / (is_returns.std() * np.sqrt(252))
    oos_sharpe = (oos_returns.mean() * 252 - risk_free_rate) / (oos_returns.std() * np.sqrt(252))
    
    print(f"In-Sample Sharpe:  {is_sharpe:.2f}")
    print(f"Out-of-Sample Sharpe: {oos_sharpe:.2f}")
    print(f"Full Period Sharpe: {sharpe:.2f}")
    
    return df


def compute_atr(df, period=14):
    """Average True Range calculation."""
    high_low = df['high'] - df['low']
    high_close = (df['high'] - df['close'].shift(1)).abs()
    low_close = (df['low'] - df['close'].shift(1)).abs()
    true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    return true_range.rolling(period).mean()
`,
  },
];

export function getStrategyById(id) {
  return EXAMPLE_STRATEGIES.find(s => s.id === id);
}

export function getStrategyNames() {
  return EXAMPLE_STRATEGIES.map(s => ({ id: s.id, name: s.name, description: s.description }));
}
