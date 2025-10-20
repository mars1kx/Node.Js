const Logger = require('./lib/logger');

class LogAnalyzer {
  constructor(filterType = null) {
    this.logger = new Logger('logs');
    this.filter = filterType;
  }

  static showHelp() {
    console.log('\n=== LOG ANALYZER HELP ===\n');
    console.log('Usage: node analyzer.js [options]\n');
    console.log('Options:');
    console.log('  --type <type>    Filter by log type (info, success, warning, error)');
    console.log('  --help           Show this help\n');
    console.log('Examples:');
    console.log('  node analyzer.js');
    console.log('  node analyzer.js --type error');
    console.log('  node analyzer.js --type success\n');
  }

  static getOptions() {
    const args = process.argv;
    let filterType = null;
    let showHelp = false;

    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--help' || args[i] === '-h') {
        showHelp = true;
      } else if (args[i] === '--type' && i + 1 < args.length) {
        filterType = args[i + 1].toUpperCase();
        i++;
      }
    }

    return { filterType, showHelp };
  }

  printResults(result) {
    console.log('\n=== LOG ANALYSIS RESULTS ===\n');
    
    if (this.filter) {
      console.log('Filter:', this.filter);
    }
    
    console.log('Total files:', result.totalFiles);
    console.log('Total logs:', result.totalLogs);
    
    if (result.totalFiles === 0) {
      console.log('\nNo log files found. Run generator first.\n');
      return;
    }
    
    console.log('\nStats:');
    console.log('  SUCCESS:', result.stats.SUCCESS);
    console.log('  INFO:', result.stats.INFO);
    console.log('  WARNING:', result.stats.WARNING);
    console.log('  ERROR:', result.stats.ERROR);
    
    console.log('\n');
  }

  async run() {
    console.log('Analyzing logs...\n');
    
    try {
      const result = await this.logger.analyze(this.filter);
      this.printResults(result);
    } catch (err) {
      console.error('Error analyzing logs:', err.message);
    }
  }
}

if (require.main === module) {
  const options = LogAnalyzer.getOptions();
  
  if (options.showHelp) {
    LogAnalyzer.showHelp();
    process.exit(0);
  }
  
  const analyzer = new LogAnalyzer(options.filterType);
  analyzer.run();
}

module.exports = LogAnalyzer;

