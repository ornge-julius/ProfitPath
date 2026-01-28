<img width="800" height="800" alt="FullLogo_Transparent" src="https://github.com/user-attachments/assets/9c636134-6144-411d-a2d2-ee71d99d4757" /> 

# ProfitPath
This project combines my two passions, coding and trading. I built this application to better understand my trading habits and strategies. The purpose of this app is to help tracking my path to profitability.
## Features

### Core Trading Features
- **Multi-Account Management**: Create, edit, delete, and switch between multiple trading accounts
- **Trade Management**: Add, edit, view, and delete detailed trade information with inline editing
- **Tag System**: Organize trades with custom tags, including color customization and usage tracking
- **Performance Analytics**: Real-time calculation of win rate, P&L, average win/loss, and account balance

### Data Visualization
- **Cumulative Net Profit Chart**: Track your overall profit trajectory over time
- **Monthly Net P&L Chart**: Bar chart showing monthly profit and loss breakdown
- **Last 30 Days Net P&L Chart**: Daily P&L visualization for recent performance
- **Win/Loss Distribution Chart**: Visual breakdown of winning vs losing trades
- **Batch Comparison Charts**: Compare recent trades against previous performance
- **Account Balance Trend**: Sparkline visualization of balance changes

### Views & Navigation
- **Dashboard**: At-a-glance metrics cards and key performance charts
- **Trade History**: Comprehensive trade table with sorting and filtering
- **Trade Detail Page**: Individual trade view with full details and inline editing
- **Tags Management**: Create, edit, and organize your trading tags
- **Trade Batch Comparison**: Analyze your most recent trades vs previous batch

### User Experience
- **Bottom Navigation Dock**: macOS-style dock with magnification effect for quick navigation
- **Global Date Filter**: Filter all data by date range across views
- **Global Tag Filter**: Filter trades by tags with AND/OR logic modes
- **Dark/Light Theme**: Toggle between elegant dark and warm light themes
- **Demo Mode**: Browse sample data without authentication
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: GSAP and Motion-powered transitions and effects

### Authentication & Security
- **Supabase Authentication**: Secure email/password sign-in
- **Protected Actions**: Edit and delete operations require authentication
- **Demo Data Access**: Unauthenticated users can view demo data in read-only mode

## Technology Stack

- **React 18+** - Modern React with hooks and functional components
- **React Router v7** - Client-side routing with nested routes
- **JavaScript (JSX)** - Pure JavaScript, no TypeScript
- **Tailwind CSS v3** - Utility-first CSS with custom design tokens
- **MUI Material** - SwipeableDrawer and other UI components
- **Recharts** - Responsive charting library
- **Lucide React** - Modern icon library
- **Supabase** - Hosted PostgreSQL database and authentication
- **GSAP** - Professional-grade animations
- **Motion** - React animation library (Framer Motion fork)
- **date-fns** - Modern date utility library
- **Vercel Analytics** - Performance monitoring and analytics

## Project Structure

```
app/src/
├── components/
│   ├── charts/              # Data visualization components
│   │   ├── AccountBalanceChart.jsx
│   │   ├── BatchComparisonLineChart.jsx
│   │   ├── CumulativeNetProfitChart.jsx
│   │   ├── CumulativeProfitChart.jsx
│   │   ├── Last30DaysNetPNLChart.jsx
│   │   ├── MonthlyNetPNLChart.jsx
│   │   └── WinLossChart.jsx
│   ├── forms/               # Form components
│   │   ├── AccountEditForm.jsx
│   │   ├── SettingsForm.jsx
│   │   ├── SignInForm.jsx
│   │   ├── TagForm.jsx
│   │   └── TradeForm.jsx
│   ├── tables/              # Table components
│   │   └── TradeHistoryTable.jsx
│   ├── ui/                  # UI components
│   │   ├── animation/       # Animation wrappers
│   │   ├── cards/           # Metric card components
│   │   │   ├── AvgWLCard.jsx
│   │   │   ├── CurrentBalanceCard.jsx
│   │   │   ├── NetProfitCard.jsx
│   │   │   └── WinRateCard.jsx
│   │   ├── AccountSelector.jsx
│   │   ├── BottomNavDock.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── DashboardMetricsCards.jsx
│   │   ├── DemoModeBanner.jsx
│   │   ├── Dock.jsx
│   │   ├── GlobalDateFilter.jsx
│   │   ├── GlobalTagFilter.jsx
│   │   ├── Header.jsx
│   │   ├── TagBadge.jsx
│   │   ├── TagCard.jsx
│   │   ├── TagSelector.jsx
│   │   └── TradeDetailView.jsx
│   └── views/               # Page-level view components
│       ├── DashboardView.jsx
│       ├── TagsManagementView.jsx
│       ├── TradeBatchComparisonView.jsx
│       ├── TradeDetailPage.jsx
│       └── TradeHistoryView.jsx
├── context/                 # React Context providers
│   ├── DateFilterContext.jsx
│   ├── DemoModeContext.jsx
│   ├── TagContext.jsx
│   ├── TagFilterContext.jsx
│   └── ThemeContext.jsx
├── hooks/                   # Custom React hooks
│   ├── useAppState.js
│   ├── useAuth.js
│   ├── useFilteredTrades.js
│   ├── useTagManagement.js
│   └── useTradeManagement.js
├── reducers/                # State management reducers
│   ├── accountsReducer.js
│   ├── tradeReducer.js
│   └── usersReducer.js
├── utils/                   # Utility functions
│   └── calculations.js
├── App.jsx                  # Main application component with routing
├── index.js                 # Application entry point
├── index.css                # Global styles and design system
└── supabaseClient.js        # Supabase client configuration
```

## Design System

ProfitPath uses a custom **Monochrome Luxe** design system featuring:

### Typography
- **Display Font**: Cormorant Garamond - Elegant serif for headings
- **Mono Font**: IBM Plex Mono - Clean monospace for data and body text

### Color Palette

#### Light Mode
- Warm cream backgrounds (#FAF8F5, #F5F2ED)
- Deep gold accents (#9E7C3C)
- Olive green for wins (#6B8E23)
- Muted red for losses (#A04050)

#### Dark Mode
- Deep charcoal backgrounds (#0A0A0B, #141416)
- Warm gold accents (#C9A962)
- Gold tones for wins
- Burgundy for losses (#8B4049)

### UI Patterns
- **Card Luxe**: Elevated cards with subtle gold border highlights on hover
- **Glass Effect**: Backdrop blur for overlays and headers
- **Noise Texture**: Subtle grain overlay for depth
- **Smooth Transitions**: Elegant cubic-bezier timing functions
- **Focus Ring**: Gold accent focus indicators

## Key Components

### State Management
- **Context Providers**: Theme, DateFilter, TagFilter, Tag, DemoMode
- **Custom Hooks**: Encapsulate business logic for trades, tags, auth, and app state
- **Reducers**: Manage complex state for accounts, trades, and users

### Navigation
- **React Router**: Nested routes with protected layouts
- **Bottom Dock**: Magnification-enabled navigation dock
- **Swipeable Drawer**: Mobile-friendly side menu

### Data Flow
- **useFilteredTrades**: Combines date and tag filters
- **useTradeManagement**: CRUD operations for trades
- **useTagManagement**: CRUD operations for tags
- **useAppState**: Account management and app settings

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   cd app
   npm install
   ```
3. Configure environment variables (see below)
4. Start the development server:
   ```bash
   npm start
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production
```bash
npm run build
```

### Docker Setup

You can run the application using Docker Compose, which simplifies the setup process.

1.  **Prerequisites**:
    - Docker and Docker Compose installed on your machine.

2.  **Environment Variables**:
    - Ensure you have a `.env` file in the **root directory** of the project (same level as `docker-compose.yml`).
    - This file must contain your Supabase credentials:
      ```env
      REACT_APP_SUPABASE_URL=your-supabase-url
      REACT_APP_SUPABASE_ANON_KEY=your-anon-key
      REACT_APP_DEMO_USER_ID=demo-user-id
      REACT_APP_DEMO_AUTH_USER_ID=demo-auth-user-id
      ```

3.  **Run with Docker**:
    - Start the application in detached mode:
      ```bash
      docker compose up --build -d
      ```
    - The application will be available at [http://localhost](http://localhost).

4.  **Stop the Application**:
    ```bash
    docker compose down
    ```

### Supabase Configuration

1. Create a project at [Supabase](https://supabase.com/) and note the Project URL and anon key.
2. Create a `.env` file in the `app/` directory with your credentials:

   ```env
   REACT_APP_SUPABASE_URL=your-supabase-url
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   REACT_APP_DEMO_USER_ID=your-demo-user-id
   REACT_APP_DEMO_AUTH_USER_ID=your-demo-auth-user-id
   ```

3. Required database tables:
   - `trades` - Trade history records
   - `accounts` - User accounts with `starting_balance`
   - `tags` - Custom trade tags
   - `trade_tags` - Junction table for trade-tag associations

## Data Structure

### Trade Object
```javascript
{
  id: number,              // Unique identifier
  symbol: string,          // Stock symbol (e.g., "AAPL")
  position_type: 1 | 2,    // Option type (1=CALL, 2=PUT)
  entryPrice: number,      // Entry price per contract
  exitPrice: number,       // Exit price per contract
  quantity: number,        // Number of contracts
  entry_date: string,      // Entry date (YYYY-MM-DD)
  exit_date: string,       // Exit date (YYYY-MM-DD)
  profit: number,          // Calculated profit/loss
  notes: string,           // Extended notes/observations
  reasoning: string,       // Reason for entering trade
  result: 1 | 0,           // Trade outcome (1=WIN, 0=LOSS)
  option: string,          // Option contract description
  source: string,          // Trade idea source
  account_id: number       // Associated account
}
```

### Tag Object
```javascript
{
  id: number,              // Unique identifier
  name: string,            // Tag name
  color: string,           // Hex color code
  usage_count: number      // Number of associated trades
}
```

### Account Object
```javascript
{
  id: number,              // Unique identifier
  name: string,            // Account name
  starting_balance: number // Initial account balance
}
```

## Architecture Patterns

### Component Design
- **Single Responsibility**: Each component has a clear, focused purpose
- **Composition**: Complex UIs built from smaller, reusable components
- **Container/Presentational**: Views handle logic, UI components focus on rendering

### State Management
- **Context Pattern**: Global state for theme, filters, and authentication
- **Custom Hooks**: Encapsulate and reuse stateful logic
- **useMemo/useCallback**: Optimized performance for expensive calculations

### Styling
- **Tailwind CSS**: Utility-first approach with custom design tokens
- **CSS Variables**: Theme-aware colors and values
- **Responsive Design**: Mobile-first with progressive enhancement

## Performance Features

- **Memoized Calculations**: useMemo for expensive metric computations
- **Efficient Re-rendering**: Proper dependency arrays and component isolation
- **Responsive Charts**: Charts adapt to container size
- **Code Splitting**: React Router lazy loading ready
- **Vercel Speed Insights**: Real-time performance monitoring

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | DashboardView | Main dashboard with metrics and charts |
| `/history` | TradeHistoryView | Complete trade history table |
| `/detail/:tradeId` | TradeDetailPage | Individual trade details |
| `/tags` | TagsManagementView | Tag management interface |
| `/comparison` | TradeBatchComparisonView | Batch performance comparison |

## Development Notes

### Code Quality
- Consistent naming conventions (camelCase for variables, PascalCase for components)
- Proper error handling with user feedback
- Performance-optimized data transformations
- Clean component separation and prop interfaces

### Testing
- Component testing ready with React Testing Library
- Reducer testing support
- Utility function testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or issues, please open an issue in the repository or contact the development team.

---

**Built with React and modern web technologies**
