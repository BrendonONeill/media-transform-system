import process from 'node:process';
import { Logger } from '../utils/logger.js';


const ErrorLogger = new Logger('error','./logs/error.txt');
const SystemLogger = new Logger('system','./logs/system.txt'); 

function cleanupBeforeCrash(error) {
  console.error('An unexpected error occurred:', error.message);
  SystemLogger.addToQueue('System Crashed');
  ErrorLogger.addToQueue(error.message);
  process.exit(1);
}

process.on('uncaughtException', (error) => {
  cleanupBeforeCrash(error);
});

async function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    SystemLogger.addToQueue('System was gracefully shutdown')
    console.log('Cleanup complete. Exiting.');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
