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
    const result = [['Name', 'Id', 'Job Id', 'Cron', 'Result', 'Date', "Time"], checkersResults.map((item) => item.slice(0, -1)).flat()];
    const results = [[], checkersResults.map((item) => item.at(-1).flat())];
    const exportData = useSelector(state => state.data);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchCheckersResults() {
            fetch('api/checker_results')
                .then(response => response.json())
                .then(response => setCheckersResults(response))
        }
        fetchCheckersResults();
    }, [])

    const checkerBlocks = (values) => {
        return (values.map((val, i) => <div className="row"
                                            style={{borderBottom: "solid", color: hover === val[0] ? 'blue' : 'black'}}
                                            onMouseEnter={() => setHover(val[0])}
                                            onMouseLeave={() => setHover(null)}
        >
            {val.map((col) => <div className="col-1"
                                   style={{margin: "15px"}}

                                   onClick={() => {
                                       setCheckerRes(results[i]);
                                       setChosen(true)
                                   }}>{col}</div>)}
        </div>))
    }

    const onSubmitButton = () => {
        navigate('/');
    }

    return (
        <div className="row">
            <div className="col">
                {checkerBlocks(result)}
            </div>
            <div className="col">
                {!isChosen || checkerRes.length === 0 && <div>Item doesn't choose</div>}
                {isChosen && checkerRes.length > 0 && <div>{checkerRes[0][0]} {checkerRes[0][1]}</div>}
            </div>
            <div className="d-grid gap-2" style={{alignSelf: "flex-start", marginTop: "100px"}}>
                <Button variant="primary" size="lg" onClick={onSubmitButton}>
                    Go Back
                    {/*{console.log(checkersResults)}*/}
                    {/*{console.log(result)}*/}
                </Button>{' '}
            </div>
        </div>


    )

}

export default CheckersList;