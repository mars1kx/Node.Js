const path = require('path');
const Logger = require('./lib/logger');

class LogGenerator {
  constructor() {
    this.logger = new Logger('logs');
    this.currentFolder = null;
    this.fileCount = 0;
  }

  getFolderName() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hour}-${minute}`;
  }

  getFileName() {
    this.fileCount++;
    const timestamp = Date.now();
    return `log_${timestamp}_${this.fileCount}.log`;
  }

  async makeFolder() {
    const folderName = this.getFolderName();
    this.currentFolder = path.join(this.logger.logDir, folderName);
    
    await this.logger.createFolder(this.currentFolder);
    console.log('Created folder:', this.currentFolder);
  }

  async makeLogFile() {
    if (!this.currentFolder) {
      await this.makeFolder();
    }

    const fileName = this.getFileName();
    const filePath = path.join(this.currentFolder, fileName);
    
    const logCount = Math.floor(Math.random() * 11) + 5;
    let content = '';
    
    for (let i = 0; i < logCount; i++) {
      content += this.logger.generateRandomLog();
    }

    await this.logger.writeToFile(filePath, content);
    console.log(`  Created file: ${fileName} (${logCount} logs)`);
  }

  async start() {
    console.log('=== LOG GENERATOR STARTED ===');
    console.log('New folder every 60 seconds');
    console.log('New file every 10 seconds');
    console.log('Press Ctrl+C to stop\n');

    await this.makeFolder();
    await this.makeLogFile();

    setInterval(async () => {
      try {
        await this.makeLogFile();
      } catch (err) {
        console.error('Error creating file:', err.message);
      }
    }, 10000);

    setInterval(async () => {
      try {
        this.fileCount = 0;
        await this.makeFolder();
      } catch (err) {
        console.error('Error creating folder:', err.message);
      }
    }, 60000);
  }
}

if (require.main === module) {
  const generator = new LogGenerator();
  generator.start();
}

module.exports = LogGenerator;

