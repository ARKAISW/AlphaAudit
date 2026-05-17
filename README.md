# AlphaAudit

**AlphaAudit is a live interactive strategy IDE for quantitative traders and researchers.** Paste or write your Python backtesting strategy and receive real-time AI-powered analysis that identifies statistical and logical bugs like look-ahead bias, survivorship bias, and overfitting. Built with IBM Bob during the May 2026 Hackathon, it acts as your AI co-pilot to catch the invisible errors that silently destroy P&L.

## 🎯 The Problem

Quant strategies are uniquely dangerous code - they don't throw errors when they're wrong, they just lose money. AlphaAudit catches:

- 🔴 **Look-ahead bias** - Using future data in signals
- 🔴 **Survivorship bias** - Testing only on surviving assets
- 🟡 **Overfitting** - Too many parameters tuned to noise
- 🟡 **Sharpe ratio errors** - Wrong calculations
- 🟡 **Transaction cost neglect** - Ignoring slippage/commissions
- 🔵 **Position sizing issues** - Incorrect risk management

## 🚀 Features

- **Live Code Analysis**: Real-time AI-powered strategy audits using Groq (Llama 3.3 70B)
- **Monaco Editor**: Full Python syntax highlighting with inline error markers
- **Equity Curve Visualization**: See how biases inflate your backtest performance
- **One-Click AI Fixes**: Side-by-side diff view with AI-suggested corrections
- **Score Dashboard**: Alpha Score, Bias Risk, and Code Quality metrics
- **Example Strategies**: Pre-loaded broken strategies to demonstrate capabilities
- **Export Reports**: Comprehensive JSON audit reports
- **Resizable Panels**: Drag-to-resize interface for customized workspace layout

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Code Editor | Monaco Editor (VS Code engine) |
| Charts | Lightweight Charts (TradingView) |
| Backend | Express.js 5 |
| Runtime AI | Groq API (Llama 3.3 70B) |
| Dev Assistant | IBM Bob Shell |

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Groq API key ([Get one here](https://console.groq.com/keys))

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd alphaaudit
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Create a `.env` file in the project root:
```env
GROQ_API_KEY=your_groq_api_key_here
```

4. **Run development server**
```bash
npm run dev:all
```

This starts both the API server (port 3001) and Vite dev server (port 5173).

**Alternative** (run separately):
```bash
# Terminal 1: API server
npm run server

# Terminal 2: Vite dev server
npm run dev
```

5. **Open in browser**
Navigate to `http://localhost:5173`

## 🎮 Usage

1. **Load an Example**: Select a pre-built strategy from the dropdown (e.g., "The Overfit Momentum Strategy")
2. **Run Audit**: Click the "Run Audit" button to analyze the code
3. **Review Findings**: See categorized issues in the audit panel with severity badges
4. **View Impact**: Check the equity curve to see how biases inflated performance
5. **Fix Issues**: Click "Fix with Bob →" on any finding to see AI-suggested corrections
6. **Apply Fixes**: Review the side-by-side diff and accept changes
7. **Export Report**: Download a comprehensive JSON audit report

## 🏗️ Project Structure

```
alphaaudit/
├── src/
│   ├── components/        # React components
│   │   ├── Header.jsx
│   │   ├── StrategyEditor.jsx
│   │   ├── AuditPanel.jsx
│   │   ├── FindingCard.jsx
│   │   ├── EquityCurve.jsx
│   │   ├── ScoreDashboard.jsx
│   │   ├── FixDrawer.jsx
│   │   ├── ExampleSelector.jsx
│   │   └── ResizablePanel.jsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useAudit.js
│   │   └── useFix.js
│   ├── lib/               # Utilities
│   │   ├── groq.js
│   │   ├── prompts.js
│   │   ├── responseParser.js
│   │   ├── equityGenerator.js
│   │   └── exampleStrategies.js
│   ├── App.jsx
│   └── main.jsx
├── server/
│   └── index.js           # Express API proxy
├── bob-report/
│   └── session.json       # IBM Bob development report
└── public/
```

## 🎥 Demo

[Video Demo Link - TBD]

### Demo Script
1. Open AlphaAudit and load "Example 1: The Overfit Momentum Strategy"
2. Click "Run Audit" and watch findings populate in real-time
3. Observe the equity curve showing divergence between reported and adjusted performance
4. Click "Fix with Bob →" on the look-ahead bias finding
5. Review and accept the AI-suggested fix
6. Re-run audit to see improved scores
7. Export the comprehensive audit report

## 🏆 IBM Bob Hackathon - May 2026

### How IBM Bob Was Used

IBM Bob Shell was instrumental in building AlphaAudit:

- **Architecture Planning**: Analyzed existing codebase and design patterns
- **Component Development**: Created custom ResizablePanel component with drag-to-resize functionality
- **Layout Refactoring**: Integrated resizable panels into the application layout
- **Bug Fixing**: Debugged CSS conflicts preventing proper resize behavior
- **Code Quality**: Ensured React best practices and clean code structure

See `bob-report/session.json` for detailed documentation of Bob's contributions.

### Submission Checklist

- [x] Public GitHub repository
- [x] IBM Bob session report (`bob-report/session.json`)
- [x] README with clear project description
- [ ] Demo video (up to 5 minutes)
- [ ] Pitch deck (PDF)
- [x] Working deployment
- [x] All example strategies functional
- [x] Export functionality working

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

Output is generated in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
```bash
vercel deploy
```

## 🤝 Contributing

This project was built for the IBM Bob Hackathon. For questions or feedback, please open an issue.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **IBM Bob Shell**: AI development assistant that accelerated development
- **Groq**: Lightning-fast LLM inference for real-time audits
- **TradingView**: Lightweight Charts library for equity curve visualization
- **Monaco Editor**: VS Code's editor component for code editing

---

**Built with IBM Bob for the May 2026 Hackathon**  
*Tools that find what's wrong in code, in the highest-stakes domain possible.*
