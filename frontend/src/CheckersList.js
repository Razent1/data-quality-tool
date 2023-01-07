import {Button} from "react-bootstrap";
import {useDispatch, useSelector} from 'react-redux';
import {setIsSubmitted} from "./store/exportData/exportData";
import {useNavigate} from "react-router-dom";


function CheckersList() {
    const result = [['Name', 'Result', 'Scheduler', 'Date'], ['val1', 'val2', 'val3'], ['val1', 'val2', 'val3']];
    const exportData = useSelector(state => state.data);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const checkerBlocks = (values) => {
        return (values.map((val) => <div className="row">
            {val.map((col) => <div className="col-2" style={{margin:"15px"}}>{col}</div>)}
        </div>))
    }

    const onSubmitButton = () => {
        navigate('/');
        // dispatch(setIsSubmitted(false));
    }


    //this will be code which fetch table from backend

    return (
        <div className="row">
            <div className="col">
                {checkerBlocks(result)}

            </div>
            <div className="col">
                Item doesn't choose
            </div>
            <div className="d-grid gap-2" style={{alignSelf: "flex-start", marginTop: "100px"}}>
                <Button variant="primary" size="lg" onClick={onSubmitButton}>
                    Go Back
                </Button>{' '}
            </div>
        </div>


    )

}

export default CheckersList;