from typing import Self
from datetime import date as Date, timedelta, datetime

class Week:
    
    def __init__(self: Self, week: int, amount: int, total: int, start: Date, end: Date):
        self._week = week
        self.amount_ = amount
        self.end_total_ = total
        self.start = start
        self.end = end
    
    def __str__(self: Self):
        return f'{self._week}: {self.amount_} -> {self.end_total_} From {self.start} to {self.end}'


# --- Build schedule ---
total = 0
weeks = []

start = [Date(2025, 8, 25), Date(2026, 1, 12)]
end = [start[0] + timedelta(days=6), start[1] + timedelta(days=6)]
delta = timedelta(days=7)

for week in range(1, 33):
    index = 1 if week > 16 else 0
    hours = 4
    if week in (16, 32):  # Finals weeks
        hours = 2
    elif week == 24:      # Spring break
        hours = 0
    total += hours
    curr = Week(week, hours, total, start[index], end[index])
    weeks.append(curr)
    start[index] += delta
    end[index] += delta

def find_total(date_str: str) -> float:
    """
    Given a date, return the cumulative hours up to that date,
    including proper handling of gaps (e.g., winter break).
    """
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("Date must be in YYYY-MM-DD format")

    # Before everything started
    if d < weeks[0].start:
        return 0.0

    # After all weeks
    if d > weeks[-1].end:
        return float(weeks[-1].end_total_)

    # Iterate through weeks
    for i, week in enumerate(weeks):
        if week.start <= d <= week.end:
            prev_total = weeks[i - 1].end_total_ if i > 0 else 0
            if week.amount_ == 0:
                return float(prev_total)

            days_into_week = (d - week.start).days + 1
            total_days = (week.end - week.start).days + 1
            progress = days_into_week / total_days
            return round(prev_total + week.amount_ * progress, 2)

        # Handle gaps between weeks
        if i < len(weeks) - 1 and week.end < d < weeks[i + 1].start:
            return float(week.end_total_)

    # Shouldn’t reach here
    return 0.0
