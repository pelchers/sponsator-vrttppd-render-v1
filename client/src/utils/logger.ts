const log = async (message: string, type: 'info' | 'error' | 'debug' = 'info') => {
  console.log(message); // Keep browser console logging
  
  // Also send to server
  try {
    await fetch('http://localhost:4000/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, type }),
    });
  } catch (error) {
    console.error('Failed to send log to server:', error);
  }
};

export default log; 