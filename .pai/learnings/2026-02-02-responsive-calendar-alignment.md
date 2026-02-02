# Responsive CSS Calendar Grid Alignment

**Date:** 2026-02-02  
**Context:** Portfolio-Fetch responsive layout debugging

## Problem
At intermediate viewport widths (768px-1024px), the calendar year label "2025" was overlapping with the weekday labels (Mon, Wed, Fri), creating an unreadable "202₅Mon" display.

## Root Cause
1. The `.calendar-year-marker` uses absolute positioning within the grid
2. At tablet widths, the weekday labels and year markers competed for limited horizontal space
3. The `.calendar-months` had a `margin-left: 30px` designed to account for weekday label width

## Solution
At the `@media (max-width: 1024px)` breakpoint:
1. **Hide weekday labels**: `.hero-calendar .calendar-days { display: none !important; }`
2. **Center month labels**: `.hero-calendar .calendar-months { margin: 0 auto !important; text-align: center !important; }`

## Key Insight
When hiding elements that affect layout, **always check for margin/padding that was designed to account for the now-hidden element's width**. Removing `margin-left: 30px` and replacing with `margin: 0 auto` was critical.

## Replication Risk
This pattern applies to any responsive layout where:
- An element is hidden at certain breakpoints
- Other elements had positioning dependent on the hidden element's dimensions
