# Raven Local Development Setup

This guide will help you set up Raven for local development with visible Python print statements and console.logs.

## Prerequisites

Make sure you have the following installed:

- **Python 3.11** (via pyenv)
- **MariaDB** with root password set to 'admin'
- **Redis**
- **Node.js** and **yarn**

### Install Prerequisites (macOS)

```bash
# Install MariaDB
brew install mariadb
brew services start mariadb

# Set MariaDB root password
mysql -u root
```

In MySQL console:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'admin';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Install Redis
brew install redis
brew services start redis

# Install Node.js and yarn
brew install node
npm install -g yarn
```

## Development Setup

### Step 1: Set up Python Environment

```bash
cd /Users/notashutosh/Documents/GitHub/raven
pyenv local 3.11
python -m venv .venv
source .venv/bin/activate
```

### Step 2: Install Frappe Bench

```bash
pip install frappe-bench
```

### Step 3: Create Fresh Bench Directory

```bash
cd /Users/notashutosh/Documents/GitHub
rm -rf raven-bench  # Remove if exists
bench init raven-bench --frappe-branch version-15
cd raven-bench
```

### Step 4: Configure Database Connection

```bash
# Create database configuration
cat > sites/common_site_config.json << 'EOF'
{
  "db_host": "localhost",
  "db_port": 3306,
  "root_password": "admin"
}
EOF
```

### Step 5: Get Raven App

**Option A: From GitHub (recommended)**
```bash
bench get-app --branch develop https://github.com/traitful-ai/raven.git
```

**Option B: From local directory (if you have uncommitted changes)**
```bash
bench get-app file:///Users/notashutosh/Documents/GitHub/raven --branch develop
```

### Step 6: Create Site and Install App

```bash
bench new-site raven.test --admin-password admin
bench --site raven.test install-app raven
```

### Step 7: Configure for Development

```bash
bench --site raven.test set-config developer_mode 1
bench --site raven.test set-config disable_website_cache 1
```

### Step 8: Start Development Server

```bash
bench start
```

### Step 9: Access Raven

- **URL**: http://raven.test:8000/raven
- **Username**: Administrator
- **Password**: admin

## Development Workflow

### Making Code Changes

#### For Python Backend Changes

1. **Edit files in the bench copy**: `/Users/notashutosh/Documents/GitHub/raven-bench/apps/raven/`
2. **Restart bench server** to see changes:
   ```bash
   # In your external terminal where bench is running
   Ctrl+C  # Stop bench
   bench start  # Restart bench
   ```

#### For Frontend Changes

1. **Edit files in**: `/Users/notashutosh/Documents/GitHub/raven-bench/apps/raven/frontend/`
2. **Hot reload** should work automatically
3. **If needed, restart frontend dev server**:
   ```bash
   cd /Users/notashutosh/Documents/GitHub/raven-bench/apps/raven/frontend
   yarn run dev
   ```

### Syncing Local Git Changes

If you make changes in your original repo (`/Users/notashutosh/Documents/GitHub/raven`) and want to sync them to the bench:

#### Method 1: Manual Copy (Quick)
```bash
# Copy specific files
cp /Users/notashutosh/Documents/GitHub/raven/path/to/file.py /Users/notashutosh/Documents/GitHub/raven-bench/apps/raven/path/to/file.py

# Restart bench
bench start
```

#### Method 2: Pull Latest Changes
```bash
cd /Users/notashutosh/Documents/GitHub/raven-bench/apps/raven
git pull origin develop

# Restart bench
cd /Users/notashutosh/Documents/GitHub/raven-bench
bench start
```

#### Method 3: Reinstall App (Clean slate)
```bash
cd /Users/notashutosh/Documents/GitHub/raven-bench

# Remove and reinstall app
bench --site raven.test uninstall-app raven
bench remove-app raven
bench get-app --branch develop https://github.com/traitful-ai/raven.git
bench --site raven.test install-app raven
bench start
```

### Debugging Tips

#### Python Print Statements
- Add print statements to files in `/Users/notashutosh/Documents/GitHub/raven-bench/apps/raven/`
- Restart bench server with `bench start`
- Print output appears in the terminal where bench is running
- Look for output in `web.1`, `worker.1`, or `scheduler.1` processes

#### JavaScript Console.logs
- Add console.log statements to frontend files
- Open browser developer tools (F12)
- Check Console tab for output

#### Common Issues

**Session Stopped Errors**
```bash
bench clear-cache
bench clear-website-cache
bench start
```

**Database Connection Issues**
```bash
# Check MariaDB is running
brew services list | grep mariadb

# Restart MariaDB
brew services restart mariadb

# Test connection
mysql -u root -padmin -e "SELECT 1;"
```

**App Installation Issues**
```bash
# Check site status
bench --site all list

# Reinstall app
bench --site raven.test install-app raven --force
```

## File Structure

```
/Users/notashutosh/Documents/GitHub/
├── raven/                          # Original repo (your fork)
└── raven-bench/                    # Frappe bench directory
    ├── apps/
    │   ├── frappe/                 # Frappe framework
    │   └── raven/                  # Raven app (copy from your repo)
    │       ├── raven/              # Python backend code
    │       └── frontend/           # React frontend code
    └── sites/
        ├── common_site_config.json # Database config
        └── raven.test/             # Site files
```

## Useful Commands

```bash
# Start/stop bench
bench start
bench stop  # Or Ctrl+C

# Clear cache
bench clear-cache
bench clear-website-cache

# Database operations
bench --site raven.test migrate
bench --site raven.test console  # Python REPL

# Site management
bench --site all list
bench drop-site raven.test --force
bench new-site raven.test --admin-password admin

# App management
bench get-app <app-url>
bench --site raven.test install-app <app-name>
bench --site raven.test uninstall-app <app-name>
```

## Environment Variables

For frontend development, you can create `.env.local` in the frontend directory:

```bash
cd /Users/notashutosh/Documents/GitHub/raven-bench/apps/raven/frontend
cat > .env.local << 'EOF'
VITE_BASE_NAME=''
VITE_SOCKET_PORT=9000
VITE_SITE_NAME=raven.test
EOF
```

---

**Happy coding! 🚀**

For issues, check the terminal output where `bench start` is running for detailed error messages.
