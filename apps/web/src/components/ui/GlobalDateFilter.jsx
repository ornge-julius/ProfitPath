import React, { useEffect, useState, useRef } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useDateFilter } from '../../context/DateFilterContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  let date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    date = new Date(dateString);
  }

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

const CalendarGrid = ({ currentMonth, currentYear, selectedStart, selectedEnd, onDateSelect }) => {
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastDayOfPreviousMonth = new Date(previousYear, previousMonth + 1, 0).getDate();

  const days = [];
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = lastDayOfPreviousMonth - i;
    days.push({ day, month: previousMonth, year: previousYear, isCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ day, month: currentMonth, year: currentYear, isCurrentMonth: true });
  }

  const remainingDays = 42 - days.length;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  for (let day = 1; day <= remainingDays; day++) {
    days.push({ day, month: nextMonth, year: nextYear, isCurrentMonth: false });
  }

  const isDateInRange = (day, month, year) => {
    if (!selectedStart || !selectedEnd) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr >= selectedStart && dateStr <= selectedEnd;
  };

  const isDateSelected = (day, month, year) => {
    if (!selectedStart && !selectedEnd) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === selectedStart || dateStr === selectedEnd;
  };

  const handleDateClick = (day, month, year) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(dateStr);
  };

  return (
    <div className="grid grid-cols-7 gap-0.5 mt-2">
      {DAYS_OF_WEEK.map((day) => (
        <div key={day} className="text-center font-mono text-[10px] text-text-muted py-2">
          {day}
        </div>
      ))}
      {days.map(({ day, month, year, isCurrentMonth }, index) => {
        const inRange = isDateInRange(day, month, year);
        const isSelected = isDateSelected(day, month, year);

        return (
          <button
            key={`${year}-${month}-${day}-${index}`}
            type="button"
            onClick={() => handleDateClick(day, month, year)}
            className={`
              aspect-square flex items-center justify-center font-mono text-xs rounded transition-all
              ${!isCurrentMonth ? 'text-text-muted' : 'text-text-secondary'}
              ${isSelected ? 'bg-gold text-bg-primary font-medium' : ''}
              ${inRange && !isSelected ? 'bg-gold/20 text-gold' : ''}
              ${!inRange && !isSelected && isCurrentMonth ? 'hover:bg-bg-elevated' : ''}
            `}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
};

const GlobalDateFilter = ({ variant = 'default' }) => {
  const { filter, presets, setPreset, setCustomRange } = useDateFilter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(filter.preset || 'allTime');
  const [customFrom, setCustomFrom] = useState(filter.from || '');
  const [customTo, setCustomTo] = useState(filter.to || '');
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (filter.from) {
      const date = new Date(`${filter.from}T00:00:00`);
      return date.getMonth();
    }
    return new Date().getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    if (filter.from) {
      const date = new Date(`${filter.from}T00:00:00`);
      return date.getFullYear();
    }
    return new Date().getFullYear();
  });
  const [selectingStart, setSelectingStart] = useState(true);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const dropdownRef = useRef(null);
  const presetDropdownRef = useRef(null);

  useEffect(() => {
    setSelectedPreset(filter.preset || 'allTime');
    setCustomFrom(filter.from || '');
    setCustomTo(filter.to || '');
    
    if (filter.from) {
      const date = new Date(`${filter.from}T00:00:00`);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  }, [filter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(event.target)) {
        setIsPresetOpen(false);
      }
    };

    if (isOpen || isPresetOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, isPresetOpen]);

  const handlePresetChange = (value) => {
    setSelectedPreset(value);
    setIsPresetOpen(false);

    if (value !== 'custom') {
      setPreset(value);
      setIsOpen(false);
    } else {
      if (!customFrom && !customTo) {
        setSelectingStart(true);
      }
    }
  };

  const handleDateSelect = (dateStr) => {
    if (selectedPreset !== 'custom') {
      setSelectedPreset('custom');
      if (filter.from && !customFrom) {
        setCustomFrom(filter.from);
      }
      if (filter.to && !customTo) {
        setCustomTo(filter.to);
      }
    }

    const currentFrom = customFrom || filter.from || '';
    if (selectingStart || !currentFrom) {
      setCustomFrom(dateStr);
      setCustomTo('');
      setSelectingStart(false);
    } else if (dateStr < currentFrom) {
      setCustomFrom(dateStr);
      setCustomTo('');
      setSelectingStart(false);
    } else {
      setCustomTo(dateStr);
      setSelectingStart(true);
    }
  };

  useEffect(() => {
    if (selectedPreset === 'custom' && customFrom && customTo) {
      setCustomRange({ from: customFrom, to: customTo });
      setIsOpen(false);
    }
  }, [customFrom, customTo, selectedPreset, setCustomRange]);

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleFromDateClick = () => {
    if (selectedPreset !== 'custom') {
      setSelectedPreset('custom');
    }
    setSelectingStart(true);
    const dateToUse = customFrom || filter.from;
    if (dateToUse) {
      const date = new Date(`${dateToUse}T00:00:00`);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  };

  const handleToDateClick = () => {
    if (selectedPreset !== 'custom') {
      setSelectedPreset('custom');
    }
    setSelectingStart(false);
    const dateToUse = customTo || filter.to || customFrom || filter.from;
    if (dateToUse) {
      const date = new Date(`${dateToUse}T00:00:00`);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  };

  const currentPresetLabel = presets.find(p => p.value === selectedPreset)?.label || 'All Time';

  const isNavbarVariant = variant === 'navbar';
  const dropdownPosition = isNavbarVariant 
    ? 'fixed left-4 right-4 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full' 
    : 'absolute left-0 md:left-auto md:right-0';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`flex items-center gap-2 rounded-lg transition-all border focus:outline-none focus-ring ${
          isNavbarVariant
            ? 'bg-bg-surface/80 hover:bg-bg-elevated border-border px-3 py-2 backdrop-blur'
            : 'bg-bg-card hover:bg-bg-elevated border-border px-4 py-2'
        }`}
      >
        <Calendar className="h-4 w-4 text-text-muted" />
        <span className={`font-mono text-xs text-text-secondary ${isNavbarVariant ? 'hidden sm:inline' : ''}`}>
          Date
        </span>
        <ChevronDown className={`h-3 w-3 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''} ${isNavbarVariant ? 'hidden sm:block' : ''}`} />
      </button>

      {isOpen && (
        <div className={`${dropdownPosition} mt-2 sm:w-72 bg-bg-card border border-border rounded-xl shadow-luxe-lg z-50 p-4`}>
          {/* Preset Dropdown */}
          <div className="relative mb-4" ref={presetDropdownRef}>
            <button
              type="button"
              onClick={() => setIsPresetOpen(!isPresetOpen)}
              className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 font-mono text-xs text-text-primary focus:outline-none focus-ring flex items-center justify-between hover:border-border-accent transition-colors"
            >
              <span>{currentPresetLabel}</span>
              <ChevronDown className={`h-3 w-3 text-text-muted transition-transform ${isPresetOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isPresetOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-bg-card border border-border rounded-lg shadow-luxe-md z-50 max-h-48 overflow-y-auto">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetChange(preset.value)}
                    className={`w-full px-3 py-2 font-mono text-xs text-left hover:bg-bg-elevated transition-colors flex items-center gap-2 ${
                      selectedPreset === preset.value ? 'text-gold' : 'text-text-secondary'
                    }`}
                  >
                    {selectedPreset === preset.value && <Check className="h-3 w-3" />}
                    <span className={selectedPreset === preset.value ? 'ml-0' : 'ml-5'}>{preset.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Display */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={handleFromDateClick}
              className={`flex-1 px-3 py-2 rounded-lg border font-mono text-xs transition-all ${
                selectingStart && selectedPreset === 'custom'
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border bg-bg-surface text-text-secondary hover:border-border-accent'
              }`}
            >
              {filter.from ? formatDisplayDate(filter.from) : 'Start'}
            </button>
            <button
              type="button"
              onClick={handleToDateClick}
              className={`flex-1 px-3 py-2 rounded-lg border font-mono text-xs transition-all ${
                !selectingStart && selectedPreset === 'custom'
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border bg-bg-surface text-text-secondary hover:border-border-accent'
              }`}
            >
              {filter.to ? formatDisplayDate(filter.to) : 'End'}
            </button>
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => handleMonthChange('prev')}
              className="p-1.5 hover:bg-bg-elevated rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-text-muted" />
            </button>
            <span className="font-mono text-xs text-text-primary">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={() => handleMonthChange('next')}
              className="p-1.5 hover:bg-bg-elevated rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </button>
          </div>

          {/* Calendar Grid */}
          <CalendarGrid
            currentMonth={currentMonth}
            currentYear={currentYear}
            selectedStart={filter.from || null}
            selectedEnd={filter.to || null}
            onDateSelect={handleDateSelect}
          />
        </div>
      )}
    </div>
  );
};

export default GlobalDateFilter;
