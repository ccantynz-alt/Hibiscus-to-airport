# MongoDB config/local Database Authorization

## The Error

When connecting to MongoDB (especially MongoDB Atlas), you may see:

```
list_collection_names failed for db config: not authorized on config to execute command { listCollections: 1, ... }
list_collection_names failed for db local: not authorized on local to execute command { listCollections: 1, ... }
```

## Cause

The `config` and `local` databases are **MongoDB system databases**:

- **config** – Used by MongoDB for sharding metadata (sharded clusters)
- **local** – Used for replica set metadata and oplog

On **MongoDB Atlas**, regular database users do **not** have access to these databases. They are restricted to cluster administration. When a tool (MongoDB Compass, Cursor MongoDB extension, IDE integrations, etc.) tries to discover all databases and list their collections, it attempts `listCollections` on `config` and `local`, which fails with `Unauthorized`.

## Impact

- **Application code**: Your app uses `client[DB_NAME]` or `client.get_default_database()` and only accesses your application database (e.g. `hibiscustoairport`). It does **not** call `list_collection_names` on `config` or `local`, so these errors do **not** affect normal operation.
- **GUI tools**: MongoDB Compass and similar tools may show these errors when discovering databases. Your application database and its collections remain accessible; the errors are for system databases you typically do not need.

## Solutions

### 1. Ignore the Errors (Recommended)

If you are only using your application database, these errors are harmless. Your app and data are unaffected. You can safely ignore them when they appear in tool output or logs.

### 2. Include Database in Connection String

Use a connection string that specifies the database, so tools know which database to use by default and may avoid probing system databases:

```
mongodb+srv://user:pass@cluster.mongodb.net/your_db_name?retryWrites=true&w=majority
```

Replace `your_db_name` with your actual database (e.g. `hibiscustoairport`).

### 3. Atlas User Permissions (If You Must Access config/local)

If you truly need access to `config` or `local` (e.g. for cluster monitoring):

1. In Atlas: **Database Access** → **Edit** your user
2. Add roles such as `clusterMonitor` or `readAnyDatabase` (use only if required)
3. Note: Atlas may still restrict access to these system databases for security reasons

### 4. Tool-Specific Configuration

- **MongoDB Compass**: Connect using a connection string that includes the database name. Compass may still try to list all databases; the errors are informational.
- **Cursor / VS Code MongoDB extension**: Use a connection string with the database specified. Some extensions allow configuring which databases to show; check their settings to limit discovery to your application database.

## Summary

| Source              | Affected? | Action                          |
|---------------------|-----------|---------------------------------|
| Application runtime| No        | None                            |
| MongoDB Compass    | Yes (UI)  | Ignore or use DB in connection  |
| Cursor/IDE MongoDB | Yes (UI)  | Ignore or use DB in connection  |

Your application database remains fully accessible; the authorization errors apply only to system databases (`config`, `local`) that your app does not use.
