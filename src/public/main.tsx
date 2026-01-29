/**
 * Public Booking Widget Entry Point
 * Separate entry point for public-facing booking widget
 */

import { createRoot } from 'react-dom/client';
import { PublicApp } from './PublicApp';
import './styles/widget.css';

// Find the root element
const rootElement = document.getElementById('booking-widget-root') || document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(<PublicApp />);
