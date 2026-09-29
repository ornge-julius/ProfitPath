import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, CalendarCheck } from 'lucide-react';
import { generateDailyPNLMap } from '../../utils/calculations';
import { useDateFilter } from '../../context/DateFilterContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatCurrency = (value) => {
  const abs = Math.abs(value);
  return `${value < 0 ? '-' : value > 0 ? '+' : ''}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const toDateKey = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const CalendarView = ({ trades }) => {
  const navigate = useNavigate();
  const { setCustomRange } = useDateFilter();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const dailyPNLMap = useMemo(() => generateDailyPNLMap(trades), [trades]);

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((year) => year - 1);
      } else {
        setCurrentMonth((month) => month - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((year) => year + 1);
      } else {
        setCurrentMonth((month) => month + 1);
      }
    }
  };

  const handleToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const handleDayClick = (dateKey, hasTrades) => {
    if (!hasTrades) return;
    setCustomRange({ from: dateKey, to: dateKey });
    navigate('/history');
  };

  const weeks = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastDayOfPreviousMonth = new Date(previousYear, previousMonth + 1, 0).getDate();

    const cells = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = lastDayOfPreviousMonth - i;
      cells.push({ day, month: previousMonth, year: previousYear, isCurrentMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, month: currentMonth, year: currentYear, isCurrentMonth: true });
    }
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: nextDay, month: nextMonth, year: nextYear, isCurrentMonth: false });
      nextDay += 1;
    }

    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      const weekCells = cells.slice(i, i + 7).map((cell) => {
        const dateKey = toDateKey(cell.year, cell.month, cell.day);
        const entry = dailyPNLMap[dateKey];
        return { ...cell, dateKey, entry: cell.isCurrentMonth ? entry : null };
      });
      const weekTotal = weekCells.reduce((sum, cell) => sum + (cell.entry?.netPNL || 0), 0);
      const weekHasTrades = weekCells.some((cell) => cell.entry);
      rows.push({ cells: weekCells, weekTotal, weekHasTrades });
    }

    return rows;
  }, [currentMonth, currentYear, dailyPNLMap]);

  const monthSummary = useMemo(() => {
    const daysInMonth = weeks.flatMap((week) => week.cells).filter((cell) => cell.isCurrentMonth && cell.entry);
    const netPNL = daysInMonth.reduce((sum, cell) => sum + cell.entry.netPNL, 0);
    const winDays = daysInMonth.filter((cell) => cell.entry.netPNL > 0).length;
    const lossDays = daysInMonth.filter((cell) => cell.entry.netPNL < 0).length;
    const best = daysInMonth.reduce((best, cell) => (!best || cell.entry.netPNL > best.entry.netPNL ? cell : best), null);
    const worst = daysInMonth.reduce((worst, cell) => (!worst || cell.entry.netPNL < worst.entry.netPNL ? cell : worst), null);

    return { netPNL, winDays, lossDays, best, worst, tradingDays: daysInMonth.length };
  }, [weeks]);

  const isToday = (cell) =>
    cell.day === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pt-4">
        <div>
          <h1 className="font-display text-display-md text-text-primary mb-2">Calendar</h1>
          <p className="font-mono text-sm text-text-muted">Daily profit and loss, month by month</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMonthChange('prev')}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-border hover:border-border-accent hover:bg-bg-elevated transition-all flex-shrink-0"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4 text-text-secondary" />
            </button>
            <div className="font-mono text-sm text-text-primary min-w-[8rem] sm:min-w-[10rem] text-center">
              {MONTHS[currentMonth]} {currentYear}
            </div>
            <button
              type="button"
              onClick={() => handleMonthChange('next')}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-border hover:border-border-accent hover:bg-bg-elevated transition-all flex-shrink-0"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4 text-text-secondary" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleToday}
            className="btn-secondary flex items-center gap-2 flex-shrink-0"
          >
            <CalendarCheck className="h-4 w-4" />
            Today
          </button>
        </div>
      </div>

      {/* Month Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        <div className="card-luxe p-5">
          <span className="stat-label mb-1 block">Month Net P&L</span>
          <p className={`font-display text-2xl tracking-tight ${monthSummary.netPNL > 0 ? 'text-gold' : monthSummary.netPNL < 0 ? 'text-loss' : 'text-text-primary'}`}>
            {monthSummary.tradingDays > 0 ? formatCurrency(monthSummary.netPNL) : '—'}
          </p>
        </div>
        <div className="card-luxe p-5">
          <span className="stat-label mb-1 block">Trading Days</span>
          <p className="font-display text-2xl text-text-primary tracking-tight">{monthSummary.tradingDays}</p>
          <span className="font-mono text-xs text-text-muted mt-1 block">
            {monthSummary.winDays}W · {monthSummary.lossDays}L
          </span>
        </div>
        <div className="card-luxe p-5">
          <span className="stat-label mb-1 block">Best Day</span>
          {monthSummary.best ? (
            <>
              <p className="font-display text-2xl text-gold tracking-tight">{formatCurrency(monthSummary.best.entry.netPNL)}</p>
              <span className="font-mono text-xs text-text-muted mt-1 block">{MONTHS[monthSummary.best.month].slice(0, 3)} {monthSummary.best.day}</span>
            </>
          ) : (
            <p className="font-mono text-sm text-text-muted">No data</p>
          )}
        </div>
        <div className="card-luxe p-5">
          <span className="stat-label mb-1 block">Worst Day</span>
          {monthSummary.worst ? (
            <>
              <p className="font-display text-2xl text-loss tracking-tight">{formatCurrency(monthSummary.worst.entry.netPNL)}</p>
              <span className="font-mono text-xs text-text-muted mt-1 block">{MONTHS[monthSummary.worst.month].slice(0, 3)} {monthSummary.worst.day}</span>
            </>
          ) : (
            <p className="font-mono text-sm text-text-muted">No data</p>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card-luxe p-3 sm:p-6 overflow-hidden">
        <div className="grid grid-cols-7 lg:grid-cols-[repeat(7,1fr)_8rem] gap-1.5 sm:gap-2 mb-2">
          {DAY_LABELS.map((label) => (
            <div key={label} className="text-center font-mono text-[10px] sm:text-xs uppercase tracking-wider text-text-muted py-2">
              {label}
            </div>
          ))}
          <div className="hidden lg:block text-center font-mono text-[10px] uppercase tracking-wider text-text-muted py-2">
            Week
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 lg:grid-cols-[repeat(7,1fr)_8rem] gap-1.5 sm:gap-2">
              {week.cells.map((cell) => {
                const hasTrades = Boolean(cell.entry);
                const isWinDay = hasTrades && cell.entry.netPNL > 0;
                const isLossDay = hasTrades && cell.entry.netPNL < 0;

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => handleDayClick(cell.dateKey, hasTrades)}
                    disabled={!hasTrades}
                    className={`
                      relative aspect-square sm:aspect-[4/3] rounded-lg border p-1.5 sm:p-2.5 flex flex-col items-start justify-between
                      transition-all text-left
                      ${!cell.isCurrentMonth ? 'border-border-subtle opacity-40' : 'border-border'}
                      ${isWinDay ? 'bg-win-bg border-win/30 hover:border-win/60' : ''}
                      ${isLossDay ? 'bg-loss-bg border-loss/30 hover:border-loss/60' : ''}
                      ${!hasTrades ? 'cursor-default' : 'cursor-pointer hover:shadow-luxe-sm'}
                      ${isToday(cell) ? 'ring-1 ring-gold ring-offset-1 ring-offset-bg-card' : ''}
                    `}
                  >
                    <span className={`font-mono text-[10px] sm:text-xs ${cell.isCurrentMonth ? 'text-text-secondary' : 'text-text-muted'}`}>
                      {cell.day}
                    </span>
                    {hasTrades && (
                      <span className={`font-mono text-[9px] sm:text-xs font-medium leading-tight ${isWinDay ? 'text-win' : 'text-loss'}`}>
                        {formatCurrency(cell.entry.netPNL)}
                      </span>
                    )}
                  </button>
                );
              })}
              <div className={`hidden lg:flex flex-col items-center justify-center rounded-lg border border-border-subtle px-2 ${
                week.weekHasTrades ? (week.weekTotal >= 0 ? 'bg-win-bg' : 'bg-loss-bg') : ''
              }`}>
                <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted mb-0.5">Total</span>
                <span className={`font-mono text-xs font-medium ${
                  !week.weekHasTrades ? 'text-text-muted' : week.weekTotal >= 0 ? 'text-win' : 'text-loss'
                }`}>
                  {week.weekHasTrades ? formatCurrency(week.weekTotal) : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-5 pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-win" />
            <span className="font-mono text-xs text-text-muted">Profitable day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-3 h-3 text-loss" />
            <span className="font-mono text-xs text-text-muted">Loss day</span>
          </div>
          <span className="font-mono text-xs text-text-muted ml-auto hidden sm:inline">Tap a day to view its trades</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
