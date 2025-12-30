import React from 'react';

const SimplePopup = ({ show, message, onClose }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
      }}>
        <h3 style={{
          margin: '0 0 15px 0',
          color: '#28a745',
          fontSize: '20px'
        }}>
          Success!
        </h3>
        <p style={{
          margin: '0 0 20px 0',
          color: '#333',
          fontSize: '16px'
        }}>
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default SimplePopup;
