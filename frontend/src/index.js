import React from 'react';
import ReactDOM from 'react-dom/client';
import Chosers from './Chosers';
import Checkbox from './Checkbox';
import Cron from './Cron';
import reportWebVitals from './reportWebVitals';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import exportData from './store/exportData/exportData';

const root = ReactDOM.createRoot(document.getElementById('root'));
const store = createStore(exportData);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <div className="container">
                <div className="row">
                    <div className="col">
                        <Chosers/>
                    </div>
                    <div className="col">
                        <Checkbox/>
                        <Cron/>
                    </div>
                </div>
            </div>
        </Provider>
    </React.StrictMode>
);

reportWebVitals();
