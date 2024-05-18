import React from 'react';
import LoadingImage from '../assets/Loading.png';
import './LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-container">
            <img src={LoadingImage} alt="Loading" className="loading-image" />
        </div>
    );
};

export default LoadingScreen;