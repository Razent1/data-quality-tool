import React from 'react';
import ReactDOM from 'react-dom/client';
import Chosers from "./Chosers";
import Checkbox from "./Checkbox";
import Cron from "./Cron";

function Main() {
    return (
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
    )
}

export default Main;