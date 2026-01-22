import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { testFirebaseConnection } from "./firebase/testfirebase";

function Root() {
    useEffect(() => {
        testFirebaseConnection().catch(console.error);
    }, []);

    return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>
);