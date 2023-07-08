## ⏱️ Timesheet Bulk Logger

A CLI application to submit Jira worklogs in bulk, useful to log daily meetings.

---

### ⬇ Installation

```
git clone https://github.com/brunobragaw8t/jira-timesheet-bulk-logger.git
```

---

### ⚙ Configuration

Configure the `.env` file:

```
CLOUD_ID=Your Atlassion Cloud ID
EMAIL=Email of your Atlassion account
API_KEY=API token generated in your account security section
```

To get your Cloud ID, go to `https://YOUR-DOMAIN.atlassian.net/_edge/tenant_info`.

To get your API Token, go [here](https://id.atlassian.com/manage-profile/security/api-tokens).

---

### 🏃 Usage

```
cd /path/to/jira-timesheet-bulk-logger
```

```
node index.js
```
