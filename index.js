import dotenv from 'dotenv';
import readline from 'readline/promises';
import chalk from 'chalk';
import { getDatesFromInterval, getIssue, isSecondDateAfterFirst, isValidDate, isValidDuration, isValidHour, isValidIssue } from './helpers.js';
import fs from 'fs';

const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
  if (
    name === `warning` &&
    typeof data === `object` &&
    data.name === `ExperimentalWarning`
    //if you want to only stop certain messages, test for the message here:
    //&& data.message.includes(`Fetch API`)
  ) {
    return false;
  }
  return originalEmit.apply(process, arguments);
};

dotenv.config();

const ri = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

global.cloudId = process.env.CLOUD_ID;
global.apiBase = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3`;
global.email = process.env.EMAIL;
global.apiKey = process.env.API_KEY;
global.token = Buffer.from(`${email}:${apiKey}`).toString('base64');

console.log();
console.log(chalk.cyan(`⏱️ Timesheet Bulk Logger`) + ` v0.1.0`);
console.log();

const issueKey = await ri.question(`Issue ID: `);

process.stdout.write(`⏳ Searching for issue...`);
const issue = await getIssue(issueKey);
process.stdout.clearLine();
process.stdout.cursorTo(0);

if (!isValidIssue(issue)) {
  console.log();
  console.log(chalk.red(`❌ Issue ${chalk.bold(issueKey)} doesn't exist!`));
  process.exit();
}

const startingDate = await ri.question(`Starting date: `);

if (!isValidDate(startingDate)) {
  console.log();
  console.log(chalk.red(`❌ Date ${chalk.bold(startingDate)} is invalid!`));
  console.log(chalk.cyan(`ℹ️ Valid date format: ${chalk.bold('Y-m-d')}`));
  process.exit();
}

const endDate = await ri.question(`End date: `);

if (!isValidDate(endDate)) {
  console.log();
  console.log(chalk.red(`❌ Date ${chalk.bold(endDate)} is invalid!`));
  console.log(chalk.cyan(`ℹ️ Valid date format: ${chalk.bold('Y-m-d')}`));
  process.exit();
}

if (!isSecondDateAfterFirst(startingDate, endDate)) {
  console.log();
  console.log(chalk.red(`❌ End date must be equal or after starting date!`));
  process.exit();
}

const hour = await ri.question(`Hour: `);

if (!isValidHour(hour)) {
  console.log();
  console.log(chalk.red(`❌ Hour ${chalk.bold(hour)} is invalid!`));
  console.log(chalk.cyan(`ℹ️ Valid hour format: ${chalk.bold('H:i')}`));
  process.exit();
}

const duration = await ri.question(`Duration (in minutes): `);

if (!isValidDuration(duration)) {
  console.log();
  console.log(chalk.red(`❌ Duration ${chalk.bold(duration)} is invalid!`));
  console.log(chalk.cyan(`ℹ️ Duration must be an integer number greater than 0.`));
  process.exit();
}

const comment = await ri.question(`Comment: `);

const dates = getDatesFromInterval(startingDate, endDate)
  .filter((d) => d.getDay() > 0 && d.getDay() < 6);

console.log();
console.log(`----------`);
console.log();
console.log(chalk.yellow(`You are about to register:`));
console.log();
console.log(chalk.cyan(`${chalk.bold(issueKey.toUpperCase())} | ${chalk.bold(issue.fields.summary)}`));
console.log(chalk.cyan(`${chalk.bold(duration + 'm')} at ${chalk.bold(hour)}`));

for (const date of dates) {
  console.log(
    chalk.cyan(
      '- ' + date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: undefined,
      })
    )
  );
}

console.log();
const proceed = await ri.question(chalk.red(`Are you sure you want to proceed? (Y/n) `));

if (!['Y', 'y', ''].includes(proceed)) {
  console.log();
  console.log(`❌ Process canceled.`);
  process.exit();
}

console.log();
process.stdout.write(`⏳ Submitting...`);

const [hours, minutes] = hour.split(':');

for (const date of dates) {
  date.setHours(hours);
  date.setMinutes(minutes);

  const response = await fetch(`${apiBase}/issue/${issueKey}/worklog`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: {
          content: [
            {
              content: [
                {
                  text: comment,
                  type: 'text',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'doc',
          version: 1,
        },
        started: date.toISOString().replace('Z', '+0000'),
        timeSpent: `${duration}m`,
      }),
    }
  );

  const json = await response.json();

  fs.appendFileSync('./activity.log', json.id + '\n');
}

process.stdout.clearLine();
process.stdout.cursorTo(0);

console.log(chalk.green(`✔️ Done!`));
console.log();
console.log(chalk.cyan(`ℹ️ Worklog IDs were saved to ${chalk.bold('activiy.log')}`));
console.log();
console.log(`Made with ❤ by Bruno Braga`);

process.exit();
