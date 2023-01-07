import React from 'react';
import ReactDOM from 'react-dom/client';
import Chosers from './Chosers';
import Checkbox from './Checkbox';
import CheckersList from './CheckersList';
import Main from './Main';
import Cron from './Cron';
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
                {/*<div className="container">*/}
                {/*    <div className="row">*/}
                {/*        <div className="col">*/}
                {/*            <Chosers/>*/}
                {/*        </div>*/}
                {/*        <div className="col">*/}
                {/*            <Checkbox/>*/}
                {/*            <Cron/>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <Routes>
                    <Route exact path="/" element={<Main/>}></Route>
                    <Route exact path="/checkers" element={< CheckersList />}></Route>
                </Routes>
            </Router>
        </Provider>
    </React.StrictMode>
);

reportWebVitals();
