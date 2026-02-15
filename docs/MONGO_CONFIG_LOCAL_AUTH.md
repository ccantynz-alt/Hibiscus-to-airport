# MongoDB config/local Database Authorization

## Error

```
list_collection_names failed for db config: not authorized on config to execute command { listCollections: 1, ... }
list_collection_names failed for db local: not authorized on local to execute command { listCollections: 1, ... }
```

This occurs when MongoDB Compass, mongosh, or other tools try to list collections on the internal `config` and `local` databases. These databases store cluster metadata and require explicit read permissions.

## Fix: Grant Roles in MongoDB Atlas

### Option A: Add Custom Database Roles (Recommended)

1. Go to **MongoDB Atlas** → **Database Access** → select your database user → **Edit**.
2. Under **Database User Privileges**, click **Add Custom Role**.
3. Add two privileges:
   - **Database:** `config` → **Role:** `read`
   - **Database:** `local` → **Role:** `read`
4. Save changes.

### Option B: Use clusterMonitor Role

1. Go to **MongoDB Atlas** → **Database Access** → select your database user → **Edit**.
2. Under **Built-in Role**, add **clusterMonitor** (includes read on `config` and `local`).
3. Save changes.

### Option C: Connection String for App-Only Access

If you only need the app to work (no Compass/CLI browsing of config/local), ensure your connection string specifies the default database so the app never touches config/local:

```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/hibiscus_airport?retryWrites=true&w=majority
```

The app uses `DB_NAME` and only accesses your application database. The config/local errors typically come from **Compass** or **mongosh** when they enumerate all databases.

## Summary

| Tool        | Needs config/local? | Fix                                      |
|-------------|---------------------|------------------------------------------|
| App (PyMongo) | No                  | Uses `DB_NAME` only; no change needed    |
| Compass     | Yes (lists all DBs) | Grant `read` on `config` and `local`      |
| mongosh     | Yes (show dbs)      | Grant `read` on `config` and `local`      |
