import React from 'react';
import ReactDOM from 'react-dom/client';
import CheckersList from './CheckersList';
import Main from './Main';
import reportWebVitals from './reportWebVitals';
import {Provider, useSelector} from 'react-redux';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import {createStore} from 'redux';
import exportData from './store/exportData/exportData';

const root = ReactDOM.createRoot(document.getElementById('root'));
const store = createStore(exportData);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route exact path="/" element={<Main/>}></Route>
                    <Route exact path="/checkers" element={< CheckersList />}></Route>
                </Routes>
            </Router>
        </Provider>
    </React.StrictMode>
);

reportWebVitals();
