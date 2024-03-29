import {Button} from "react-bootstrap";
import {Link, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";


function CheckersList() {
    const [checkersResults, setCheckersResults] = useState([]);
    const [hover, setHover] = useState(null);
    const [isChosen, setChosen] = useState(false);
    const [checkerRes, setCheckerRes] = useState([]);
    const [info, setInfo] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [pag, setPag] = useState(null);
    const [dataLen, setDataLen] = useState(null);
    const [history, setHistory] = useState(null);
    const resultTableValues = checkersResults.map((item) => item.slice(0, -1));
    const mainInformationResults = checkersResults.map((item) => item.at(-1));
    const navigate = useNavigate();
    const columnNames = ['Name', 'Id', 'Job Id', 'Cron', 'Result', 'Created Time', 'Run Time'];
    const pageSize = 6;
    const databricksHostName = process.env.REACT_APP_DATABRICKS_HOST_NAME;
    const databricksAccountId = process.env.REACT_APP_DATABRICKS_ACCOUNT_ID;

    useEffect(() => {
        async function fetchCheckersResults() {
            await fetch(`api/checker_results?page_num=${pageNum}`)
                .then(response => response.json())
                .then(response => {
                    setCheckersResults(response['data']);
                    setDataLen(response['total']);
                    setPag(response['pagination']);
                })
        }

        fetchCheckersResults();
    }, [pageNum]);

    useEffect(() => {
        async function setHistoryRuns() {
            if (isChosen && history == null) {
                await fetch("api/checker_history", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({'jobId': info[2]})
                })
                    .then(response => response.json())
                    .then(response => setHistory(response))
            }
        }

        setHistoryRuns();
    }, [isChosen, checkerRes])

    const checkerBlocks = (values) => {
        values.unshift(columnNames);
        return (values.map((row, i) => {
            return (
                <div className="row"
                     style={{
                         height: "15%",
                         borderBottom: "solid",
                         color: hover === row[i] && i !== 0 ? 'blue' : 'black',
                         cursor: "pointer"
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
                             setHistory(null);
                             setChosen(true);
                             setInfo(row);
                         }
                     }}
                >
                    {row.map((el, el_num) => {
                        if (el_num < 7) {
                            if (el.length > 17)
                                el = el.slice(0, 17) + "...";
                            return (<div className="col"
                                         style={{marginLeft: "5px", alignSelf: "center", fontSize: "10px"}}
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

    const openHref = (link) => {
        window.location.href = link;
    }

    const createHistoryRunsLine = () => {
        return (history.map((run) => <div
            className={'col ' + (run[3] === 'Failed' ? 'box red' : 'box green')}
            onClick={() => openHref(`https://${databricksHostName}/?o=${databricksAccountId}#job/${info[2]}/run/${info[1]}`)}
            style={{cursor: "pointer"}}></div>));
    }

    const pagination = () => {
        const pageCount = Math.ceil(dataLen / pageSize);
        const res = [];
        for (let i = 0; i <= pageCount; i++) {
            if (i < 12) {
            res.push(<div className="col-1" style={{cursor: "pointer"}} onClick={() => {
                setPageNum(i + 1);
                setCheckersResults([]);
            }}>{i + 1}</div>)}
        }
        return res;
    }

    return (
        <div className="container-fluid" style={{height: "100vh"}}>
            <div className="row" style={{height: "100%"}}>
                {checkersResults.length === 0 && <div className="col">Loading...</div>}
                {checkersResults.length !== 0 && <div className="col">
                    {checkerBlocks(resultTableValues)}
                    <div className="row" style={{marginTop: "20px"}}>{pagination()}</div>
                </div>}
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
                                href={`https://${databricksHostName}/?o=${databricksAccountId}#job/${info[2]}/run/${info[1]}`}>{info[1]}</a>
                            </div>
                            <div className="row" style={{margin: "15px"}}>Job Id: <a
                                href={`https://${databricksHostName}/?o=${databricksAccountId}#job/${info[2]}`}>{info[2]}</a>
                            </div>
                            <div className="row" style={{margin: "15px", borderBottom: "solid"}}>Time of
                                check: {info[5]}</div>
                            <div className="row" style={{margin: "15px", borderBottom: "solid"}}><h2
                                className="text-center"
                                style={{color: info[4] === 'Failed' ? 'red' : 'green'}}>
                                {info[4]}</h2></div>
                            {history != null && <div className="row"
                                                     style={{margin: "15px"}}>Last {history.length} runs:
                            </div>}
                            <div className="row"
                                 style={{margin: "15px"}}>{history != null ? createHistoryRunsLine() : 'Loading...'}</div>
                        </div>
                        <div className="col" style={{margin: "15px"}}>
                            <div className="row" style={{margin: "3px", borderBottom: "solid"}}><h3
                                className="text-center">Result</h3></div>
                            {resultBlock(checkerRes)}

                        </div>
                    </div>
                    }
                </div>
            </div>
        </div>
    )

}

export default CheckersList;