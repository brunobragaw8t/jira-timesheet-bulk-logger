export async function getIssue(issueKey) {
  const response = await fetch(`${apiBase}/issue/${issueKey}`,
    {
      headers: {
        'Authorization': `Basic ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );

  const json = await response.json();

  return json;
}

export function isValidIssue(issue) {
  if (!('fields' in issue)) return false;
  if (!('summary' in issue.fields)) return false;
  return true;
}

export function isValidDate(input) {
  const correctFormat = /^\d{4}-\d{2}-\d{2}$/.test(input);

  if (!correctFormat) return false;

  const date = new Date(input);

  if (isNaN(date.getTime())) return false;

  return true;
}

export function isSecondDateAfterFirst(startingDate, endDate) {
  const start = new Date(startingDate);
  const end = new Date(endDate);
  return end.getTime() - start.getTime() >= 0;
}

export function isValidHour(hour) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hour);
}

export function isValidDuration(duration) {
  if (!/^\d+$/.test(duration)) return false;
  if (duration <= 0) return false;
  return true;
}

export function getDatesFromInterval(startingDate, endDate) {
  const arr = [];

  const start = new Date(startingDate);
  const end = new Date(endDate);
  const current = new Date(start);

  while (current <= end) {
    arr.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return arr;
}
