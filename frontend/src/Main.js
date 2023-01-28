import React from 'react';
import Choosers from "./Choosers";
import Checkbox from "./Checkbox";
import Cron from "./Cron";
import {Navbar} from "react-bootstrap";
import Container from 'react-bootstrap/Container';

function Main() {
    return (
        <div className="container">

            <div className="row">
                <div className="col">
                    <Choosers/>
                </div>
                <div className="col">
                    <Checkbox/>
                    <Cron/>
                </div>
            </div>
        </div>
    )
}

export default Main;