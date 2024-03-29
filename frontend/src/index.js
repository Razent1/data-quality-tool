import React from 'react';
import ReactDOM from 'react-dom/client';
import CheckersList from './CheckersList';
import Main from './Main';
import reportWebVitals from './reportWebVitals';
import {Provider, useSelector} from 'react-redux';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import {createStore} from 'redux';
import exportData from './store/exportData/exportData';
import {Navbar} from "react-bootstrap";
import Container from "react-bootstrap/Container";

const root = ReactDOM.createRoot(document.getElementById('root'));
const store = createStore(exportData);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <Navbar bg="primary" variant="light">
                <Container>
                    <Navbar.Brand href="/">
                        <img
                            alt=""
                            src="/img_1.png"
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                        />{' '}
                        data-quality-tool
                    </Navbar.Brand>
                </Container>
            </Navbar>
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
