const fs = require('fs').promises;
const path = require('path');

class Logger {
  constructor(logDir = 'logs') {
    this.logDir = logDir;
  }

  getRandomMessage(level) {
    const messages = {
      INFO: ['System started', 'Processing data', 'Loading modules', 'Checking config'],
      SUCCESS: ['Operation completed', 'Data saved', 'File processed', 'Task done'],
      WARNING: ['Low memory', 'Slow connection', 'Timeout exceeded'],
      ERROR: ['Database error', 'File not found', 'Access denied', 'Validation failed']
    };
    
    const list = messages[level];
    return list[Math.floor(Math.random() * list.length)];
  }

  createLogEntry(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}\n`;
  }

  generateRandomLog() {
    const rand = Math.random() * 100;
    let level;
    
    if (rand < 50) {
      level = 'SUCCESS';
    } else if (rand < 80) {
      level = 'INFO';
    } else if (rand < 90) {
      level = 'WARNING';
    } else {
      level = 'ERROR';
    }
    
    const message = this.getRandomMessage(level);
    return this.createLogEntry(level, message);
  }

  async writeToFile(filePath, content) {
    try {
      await fs.appendFile(filePath, content);
      return true;
    } catch (err) {
      console.error('Write error:', err.message);
      return false;
    }
  }

  async createFolder(folderPath) {
    try {
      await fs.mkdir(folderPath, { recursive: true });
      return true;
    } catch (err) {
      console.error('Folder error:', err.message);
      return false;
    }
  }

  async readLogFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const lines = data.split('\n').filter(line => line.trim());
      
      const entries = [];
      for (const line of lines) {
        const match = line.match(/^\[(.*?)\] \[(.*?)\] (.*)$/);
        if (match) {
          entries.push({
            timestamp: match[1],
            level: match[2],
            message: match[3]
          });
        }
      }
      return entries;
    } catch (err) {
      return [];
    }
  }

  async getAllLogFiles(dir = null) {
    const searchDir = dir || this.logDir;
    let files = [];

    try {
      const items = await fs.readdir(searchDir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(searchDir, item.name);
        
        if (item.isDirectory()) {
          const subFiles = await this.getAllLogFiles(fullPath);
          files = files.concat(subFiles);
        } else if (item.name.endsWith('.log')) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error('Read error:', err.message);
      }
    }

    return files;
  }

  async analyze(filterType = null) {
    const files = await this.getAllLogFiles();
    
    const stats = {
      INFO: 0,
      SUCCESS: 0,
      WARNING: 0,
      ERROR: 0
    };

    let total = 0;

    for (const file of files) {
      const entries = await this.readLogFile(file);
      
      for (const entry of entries) {
        if (!filterType || entry.level === filterType) {
          total++;
          stats[entry.level]++;
        }
      }
    }

    return {
      totalFiles: files.length,
      totalLogs: total,
      stats: stats
    };
  }
}

module.exports = Logger;

