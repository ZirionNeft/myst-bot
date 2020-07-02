import * as dotenv from 'dotenv';
import App from './App';

// Load environment variables
dotenv.config({
    debug: !!process.env.DEBUG
});

App.start();