import {Button} from "react-bootstrap";
import {useDispatch, useSelector} from 'react-redux';
import {setIsSubmitted} from "./store/exportData/exportData";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import button from "bootstrap/js/src/button";


function CheckersList() {
    const [checkersResults, setCheckersResults] = useState([]);
    const [hover, setHover] = useState(null);
    const [isChosen, setChosen] = useState(false);
    const [checkerRes, setCheckerRes] = useState([]);
    const [info, setInfo] = useState([]);
    const [history, setHistory] = useState([]);
    const resultTableValues = checkersResults.map((item) => item.slice(0, -1));
    const mainInformationResults = checkersResults.map((item) => item.at(-1));
    const navigate = useNavigate();
    const columnNames = ['Name', 'Id', 'Job Id', 'Cron', 'Result', 'Created Time', 'Run Time'];
    //TODO put these constants to env variables in docker
    const databricksHostName = "https://dbc-18975113-1ba6.cloud.databricks.com";
    const databricksAccountId = "2520309401638937";

    useEffect(() => {
        async function fetchCheckersResults() {
            fetch('api/checker_results')
                .then(response => response.json())
                .then(response => setCheckersResults(response))
        }

        fetchCheckersResults();
    }, []);

    useEffect(() => {
        async function setHistory() {
            if (isChosen) {
                await fetch("api/checker_history", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({'jobId': info[2]})
                })
                    .then(response => response.json())
                    .then(response => setHistory(response));
            }
        }

        setHistory();
    }, [isChosen, checkerRes])

    const checkerBlocks = (values) => {
        values.unshift(columnNames);
        return (values.map((row, i) => {
            return (
                <div className="row"
                     style={{
                         height: "25%",
                         borderBottom: "solid",
                         color: hover === row[i] && i !== 0 ? 'blue' : 'black'
                     }}
                     onMouseEnter={() => {
                         if (i !== 0) setHover(row[i])
                     }}
                     onMouseLeave={() => {
                         if (i !== 0) setHover(null)
                     }}
                     onClick={() => {
                         if (i !== 0) {
                             setCheckerRes(mainInformationResults[i - 1]);
                             setHistory([]);
                             setChosen(true);
                             setInfo(row);
                         }
                     }}
                >
                    {row.map((el, el_num) => {
                        if (el_num < 7) {
                            return (<div className="col"
                                         style={{marginLeft: "5px", alignSelf: "center", fontSize: "15px"}}
                            >{el}</div>)
                        }
                    })}
                </div>)
        }))
    }

    const resultBlock = (checkerRes) => {
        return (checkerRes.map((row) => <div className="row"
                                             style={{margin: "15px"}}>{row[0]}: {row[1]}</div>))
    }

    const onSubmitButton = () => {
        navigate('/');
    }

    return (
        <div className="container-fluid" style={{height: "100vh"}}>
            <div className="row" style={{height: "100%"}}>
                <div className="col">
                    {checkerBlocks(resultTableValues)}
                </div>
                <div className="col">
                    {(!isChosen || checkerRes.length === 0) &&
                        <div className="row justify-content-center">Item doesn't choose</div>}
                    {isChosen && checkerRes.length > 0 && <div className="row">
                        <div className="col" style={{margin: "15px"}}>
                            <div className="row" style={{margin: "3px", borderBottom: "solid"}}><h3
                                className="text-center">Main information</h3></div>
                            <div className="row" style={{margin: "15px"}}>Name: {info[0]}</div>
                            <div className="row" style={{margin: "15px"}}>Checker type: {info[8]}</div>
                            <div className="row" style={{margin: "15px"}}>Checked table: {info[7]}</div>
                            <div className="row" style={{margin: "15px"}}>Run Id: <a
                                href={`${databricksHostName}/?o=${databricksAccountId}#job/${info[2]}/run/${info[1]}`}>{info[1]}</a>
                            </div>
                            <div className="row" style={{margin: "15px"}}>Job Id: <a
                                href={`${databricksHostName}/?o=${databricksAccountId}#job/${info[2]}`}>{info[2]}</a>
                            </div>
                            <div className="row" style={{margin: "15px", borderBottom: "solid"}}>Time of
                                check: {info[5]}</div>
                            <div className="row" style={{margin: "15px"}}><h2 className="text-center"
                                                                              style={{color: info[4] === 'Failed' ? 'red' : 'green'}}>
                                {info[4]}</h2></div>

                        </div>
                        <div className="col" style={{margin: "15px"}}>
                            <div className="row" style={{margin: "3px", borderBottom: "solid"}}><h3
                                className="text-center">Result</h3></div>
                            {resultBlock(checkerRes)}

                        </div>
                    </div>
                    }
                </div>
                <div className="d-grid gap-2" style={{alignSelf: "flex-start", marginTop: "100px"}}>
                    <Button variant="primary" size="lg" onClick={onSubmitButton}>
                        Go Back
                    </Button>{' '}
                </div>
            </div>
        </div>
    )

}

export default CheckersList;