# Log System

node.js project for generating and analyzing logs

## How to run

Start generator:
```
node generator.js
```

Analyze logs:
```
node analyzer.js
```

Filter by type:
```
node analyzer.js --type error
```

Show help:
```
node analyzer.js --help
```

## Files

- `lib/logger.js` - shared logger class
- `generator.js` - creates log files every 10 sec, new folder every minute
- `analyzer.js` - reads logs and shows stats

Logs saved in `logs/` folder.

