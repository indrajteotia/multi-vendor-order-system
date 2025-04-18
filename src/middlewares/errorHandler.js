const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
  
    // Role permission errors
    if (err.message.includes('not authorized')) {
      return res.status(403).json({
        success: false,
        message: err.message
      });
    }
  
    // Default error
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  };
  
  module.exports = errorHandler;